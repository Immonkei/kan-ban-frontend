import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";

import {
  LoginDocument,
  RegisterDocument,
  MeDocument,
  LogoutDocument,
} from "../gql/graphql";

import { AuthContext, type AuthUser } from "./AuthContext";
import { tokenStorage } from "../utils/tokenStorage";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const client = useApolloClient();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [loginMutation] = useMutation(LoginDocument);
  const [registerMutation] = useMutation(RegisterDocument);
  const [logoutMutation] = useMutation(LogoutDocument);

  /**
   * SESSION RESTORE ON APP START
   */
  useEffect(() => {
    const restoreSession = async () => {
      const token = tokenStorage.getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await client.query({
          query: MeDocument,
          fetchPolicy: "network-only",
        });

        if (data?.me) {
          setUser(data.me);
        } else {
          tokenStorage.clear();
          setUser(null);
        }
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [client]);

  /**
   * SIGN IN
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      });

      const payload = data?.login;

      if (!payload) throw new Error("Login failed");

      tokenStorage.setTokens(
        payload.accessToken,
        payload.refreshToken
      );

      setUser(payload.user);
    },
    [loginMutation]
  );

  /**
   * SIGN UP
   */
  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await registerMutation({
        variables: { input: { name, email, password } },
      });

      const payload = data?.register;

      if (!payload) throw new Error("Register failed");

      tokenStorage.setTokens(
        payload.accessToken,
        payload.refreshToken
      );

      setUser(payload.user);
    },
    [registerMutation]
  );

  /**
   * LOGOUT
   */
  const logout = useCallback(() => {
    // Fire-and-forget: call the backend to invalidate the refresh token in DB.
    // We clear local state regardless of mutation outcome so the UI is responsive.
    void logoutMutation().catch(() => {
      // swallow — local cleanup happens below regardless
    });
    tokenStorage.clear();
    setUser(null);
    client.clearStore();
  }, [client, logoutMutation]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      signIn,
      signUp,
      logout,
    }),
    [user, loading, signIn, signUp, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}