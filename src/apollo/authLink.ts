import { ApolloLink } from "@apollo/client";
import { tokenStorage } from "../utils/tokenStorage";

export const authLink = new ApolloLink((operation, forward) => {
  const token = tokenStorage.getAccessToken();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return forward(operation);
});