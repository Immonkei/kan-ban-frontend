import { useMutation } from "@apollo/client/react";

import {
  RegisterDocument,
  type RegisterMutation,
  type RegisterMutationVariables,
} from "../gql/graphql";

export function useRegister() {
  return useMutation<RegisterMutation, RegisterMutationVariables>(
    RegisterDocument
  );
}
