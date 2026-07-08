import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import { authLink } from "./authLink";
import { tokenRefreshLink } from "./tokenRefreshLink";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

export const client = new ApolloClient({
  link: authLink.concat(tokenRefreshLink).concat(httpLink),
  cache: new InMemoryCache(),
});