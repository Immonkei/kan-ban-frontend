import { ApolloClient } from "@apollo/client";

import { LoginDocument, RegisterDocument, type LoginMutationVariables, type RegisterMutationVariables } from "../gql/graphql";

export class AuthService {
  constructor(private client: ApolloClient) {}

  async login(input: LoginMutationVariables["input"]) {
    const { data } = await this.client.mutate<
      { login: { accessToken: string; refreshToken: string; user: { id: string; name: string; email: string; role: string } } },
      LoginMutationVariables
    >({
      mutation: LoginDocument,
      variables: {
        input,
      },
    });

    if (!data) {
      throw new Error("Login failed");
    }

    return data.login;
  }

  async register(input: RegisterMutationVariables["input"]) {
    const { data } = await this.client.mutate<
      { register: { accessToken: string; refreshToken: string; user: { id: string; name: string; email: string; role: string } } },
      RegisterMutationVariables
    >({
      mutation: RegisterDocument,
      variables: {
        input,
      },
    });

    if (!data) {
      throw new Error("Registration failed");
    }

    return data.register;
  }
}
