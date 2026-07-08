import { useMutation } from "@apollo/client/react";
import {
  CreateTaskDocument,
  UpdateTaskDocument,
  DeleteTaskDocument,
  ArchiveTaskDocument,
  AssignTaskDocument,
  UpdateTaskStatusDocument,
} from "../gql/graphql";
import type { Task, TaskStatus } from "../types/task";

interface UseTaskOperationsProps {
  boardId?: string;
  onSuccess?: () => void;
  onAssignSuccess?: (assignee: any) => void;
}

export function useTaskOperations({
  boardId,
  onSuccess,
  onAssignSuccess,
}: UseTaskOperationsProps = {}) {
  const [createTaskMutation, { loading: creating }] = useMutation(
    CreateTaskDocument,
    {
      onCompleted: () => {
        onSuccess?.();
      },
    }
  );

  const [updateTaskMutation] = useMutation(UpdateTaskDocument, {
    onCompleted: () => {
      onSuccess?.();
    },
  });

  const [deleteTaskMutation] = useMutation(DeleteTaskDocument, {
    onCompleted: () => {
      onSuccess?.();
    },
  });

  const [archiveTaskMutation] = useMutation(ArchiveTaskDocument, {
    onCompleted: () => {
      onSuccess?.();
    },
  });

  const [assignTaskMutation] = useMutation(AssignTaskDocument, {
    onCompleted: (data) => {
      if (data?.assignTask?.assignee) {
        onAssignSuccess?.(data.assignTask.assignee);
      }
      onSuccess?.();
    },
  });

  const [updateTaskStatusMutation] = useMutation(UpdateTaskStatusDocument, {
    onCompleted: () => {
      onSuccess?.();
    },
  });

  const createTask = async (
    newTask: Omit<
      Task,
      "id" | "createdAt" | "assignee" | "isArchived" | "creator" | "comments"
    >
  ) => {
    if (!boardId) return;
    return createTaskMutation({
      variables: { input: { ...newTask, boardId } },
    });
  };

  const updateTask = async (
    id: string,
    updatedData: Omit<
      Task,
      "id" | "createdAt" | "assignee" | "isArchived" | "creator" | "comments"
    >
  ) => {
    return updateTaskMutation({
      variables: { id, input: updatedData },
    });
  };

  const deleteTask = async (id: string) => {
    return deleteTaskMutation({
      variables: { id },
    });
  };

  const archiveTask = async (id: string) => {
    return archiveTaskMutation({
      variables: { id },
    });
  };

  const assignTask = async (taskId: string, userId: string, selectedMemberUser: any) => {
    return assignTaskMutation({
      variables: { taskId, userId },
      optimisticResponse: {
        __typename: "Mutation" as const,
        assignTask: {
          __typename: "Task" as const,
          id: taskId,
          assignee: selectedMemberUser
            ? {
                __typename: "User" as const,
                id: selectedMemberUser.id,
                name: selectedMemberUser.name,
                email: selectedMemberUser.email,
              }
            : null,
        },
      } as any,
    });
  };

  const changeTaskStatus = async (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    return updateTaskStatusMutation({
      variables: { id: task.id, status },
      optimisticResponse: {
        __typename: "Mutation" as const,
        updateTaskStatus: {
          __typename: "Task" as const,
          id: task.id,
          status,
          updatedAt: new Date().toISOString(),
        },
      } as any,
    });
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    archiveTask,
    assignTask,
    changeTaskStatus,
    creatingTask: creating,
  };
}
