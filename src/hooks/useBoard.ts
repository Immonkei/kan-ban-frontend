import { useQuery } from "@apollo/client/react";
import { BoardDocument } from "../gql/graphql";

export function useBoard(boardId: string) {
  const { data, loading, error, refetch } = useQuery(BoardDocument, {
    variables: { id: boardId },
    skip: !boardId,
  });

  return {
    board: data?.board ?? null,
    tasks: data?.board?.tasks ?? [],
    loading,
    error,
    refetch, 
  };
}