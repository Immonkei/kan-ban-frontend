import { useMutation } from "@apollo/client/react";
import {
  AddCommentDocument,
  UpdateCommentDocument,
  DeleteCommentDocument,
} from "../gql/graphql";

interface UseCommentsProps {
  onSuccess?: () => void;
}

export function useComments({ onSuccess }: UseCommentsProps = {}) {
  const [addCommentMutation] = useMutation(AddCommentDocument, {
    onCompleted: () => onSuccess?.(),
  });

  const [updateCommentMutation] = useMutation(UpdateCommentDocument, {
    onCompleted: () => onSuccess?.(),
  });

  const [deleteCommentMutation] = useMutation(DeleteCommentDocument, {
    onCompleted: () => onSuccess?.(),
  });

  const addComment = async (taskId: string, content: string) => {
    return addCommentMutation({ variables: { taskId, content } });
  };

  const updateComment = async (id: string, content: string) => {
    return updateCommentMutation({ variables: { id, content } });
  };

  const deleteComment = async (id: string) => {
    return deleteCommentMutation({ variables: { id } });
  };

  return {
    addComment,
    updateComment,
    deleteComment,
  };
}
