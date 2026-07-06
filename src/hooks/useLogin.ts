import { useMutation } from "@apollo/client/react";

import {
  LoginDocument,
  type LoginMutation,
  type LoginMutationVariables,
} from "../gql/graphql";

export function useLogin() {
  return useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument
  );
}
