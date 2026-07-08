import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import {
  CreateBoardDocument,
  UpdateBoardDocument,
  DeleteBoardDocument,
  ArchiveBoardDocument,
  AddBoardMemberDocument,
  RemoveBoardMemberDocument,
  UpdateBoardMemberRoleDocument,
  BoardsDocument,
  BoardDocument,
} from "../gql/graphql";

export function useBoardOperations(boardId?: string) {
  const navigate = useNavigate();

  const [createBoardMutation] = useMutation(CreateBoardDocument, {
    onCompleted: (data) => {
      if (data?.createBoard) {
        navigate(`/board/${data.createBoard.id}`);
      }
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [updateBoardMutation] = useMutation(UpdateBoardDocument, {
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [deleteBoardMutation] = useMutation(DeleteBoardDocument, {
    onCompleted: () => {
      navigate("/board");
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [archiveBoardMutation] = useMutation(ArchiveBoardDocument, {
    onCompleted: () => {
      navigate("/board");
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [addBoardMemberMutation] = useMutation(AddBoardMemberDocument, {
    refetchQueries: boardId
      ? [{ query: BoardDocument, variables: { id: boardId } }]
      : [],
  });

  const [removeBoardMemberMutation] = useMutation(RemoveBoardMemberDocument, {
    refetchQueries: boardId
      ? [{ query: BoardDocument, variables: { id: boardId } }]
      : [],
  });

  const [updateBoardMemberRoleMutation] = useMutation(
    UpdateBoardMemberRoleDocument,
    {
      refetchQueries: boardId
        ? [{ query: BoardDocument, variables: { id: boardId } }]
        : [],
    }
  );

  const createBoard = async (name: string) => {
    return createBoardMutation({ variables: { input: { name } } });
  };

  const updateBoard = async (id: string, name: string) => {
    return updateBoardMutation({ variables: { id, input: { name } } });
  };

  const deleteBoard = async (id: string) => {
    return deleteBoardMutation({ variables: { id } });
  };

  const archiveBoard = async (id: string) => {
    return archiveBoardMutation({ variables: { id } });
  };

  const addBoardMember = async (userId: string, role: "MEMBER" | "VIEWER") => {
    if (!boardId) return;
    return addBoardMemberMutation({
      variables: { boardId, userId, role },
    });
  };

  const removeBoardMember = async (userId: string) => {
    if (!boardId) return;
    return removeBoardMemberMutation({
      variables: { boardId, userId },
    });
  };

  const updateBoardMemberRole = async (userId: string, role: "MEMBER" | "VIEWER") => {
    if (!boardId) return;
    return updateBoardMemberRoleMutation({
      variables: { boardId, userId, role },
    });
  };

  return {
    createBoard,
    updateBoard,
    deleteBoard,
    archiveBoard,
    addBoardMember,
    removeBoardMember,
    updateBoardMemberRole,
  };
}
