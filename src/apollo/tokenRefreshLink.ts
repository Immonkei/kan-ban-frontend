import { Observable } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client";
import { tokenStorage } from "../utils/tokenStorage";

/**
 * Silently refreshes the access token when the server responds with an
 * UNAUTHENTICATED error and retries the failed operation.
 *
 * Compatible with Apollo Client v4 (uses `error: ErrorLike` API, not `graphQLErrors`).
 */

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string;

async function fetchNewAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation RefreshToken($token: String!) {
          refreshToken(token: $token) {
            accessToken
          }
        }
      `,
      variables: { token: refreshToken },
    }),
  });

  const json = (await response.json()) as {
    data?: { refreshToken?: { accessToken?: string } };
  };

  return json.data?.refreshToken?.accessToken ?? null;
}

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolvePending(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

export const tokenRefreshLink = new ErrorLink(({ error, operation, forward }) => {
  // Check if this is a GraphQL UNAUTHENTICATED error (Apollo v4 API)
  const isUnauthenticated =
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (err) => (err.extensions as Record<string, unknown>)?.["code"] === "UNAUTHENTICATED"
    );

  if (!isUnauthenticated) return;

  // If already refreshing, queue and wait
  if (isRefreshing) {
    return new Observable((observer) => {
      pendingQueue.push((newToken) => {
        if (!newToken) {
          observer.error(new Error("Session expired"));
          return;
        }
        operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        }));
        const sub = forward(operation).subscribe(observer);
        return () => sub.unsubscribe();
      });
    });
  }

  isRefreshing = true;

  return new Observable((observer) => {
    fetchNewAccessToken()
      .then((newToken) => {
        if (!newToken) {
          tokenStorage.clear();
          resolvePending(null);
          window.location.href = "/login";
          observer.error(new Error("Session expired"));
          return;
        }

        const existingRefresh = tokenStorage.getRefreshToken()!;
        tokenStorage.setTokens(newToken, existingRefresh);
        resolvePending(newToken);

        operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        }));

        const sub = forward(operation).subscribe(observer);
        return () => sub.unsubscribe();
      })
      .catch(() => {
        tokenStorage.clear();
        resolvePending(null);
        window.location.href = "/login";
        observer.error(new Error("Session expired"));
      })
      .finally(() => {
        isRefreshing = false;
      });
  });
});
