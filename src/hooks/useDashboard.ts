import { useQuery } from "@apollo/client/react";
import { useAuth } from "./useAuth";
import {
  BoardsDocument,
  DashboardTasksDocument,
  GetUsersDocument,
  TaskCountByStatusDocument,
} from "../gql/graphql";

export function useDashboard() {
  const { user } = useAuth();

  const {
    data: boardsData,
    loading: boardsLoading,
    error: boardsError,
  } = useQuery(BoardsDocument);

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
  } = useQuery(DashboardTasksDocument);

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(GetUsersDocument, {
    skip: user?.role !== "ADMIN" && user?.role !== "MANAGER",
  });

  // Accurate status-based counts from the backend — not derived from a partial list
  const { data: doneData } = useQuery(TaskCountByStatusDocument, {
    variables: { status: "DONE" },
  });

  const { data: progressData } = useQuery(TaskCountByStatusDocument, {
    variables: { status: "IN_PROGRESS" },
  });

  const tasks = tasksData?.tasks.data ?? [];

  return {
    dashboard: {
      boards: boardsData?.boards.length ?? 0,
      tasks: tasksData?.tasks.total ?? 0,
      users: usersData?.users.length ?? 0,
      completed: doneData?.tasks.total ?? 0,
      progress: progressData?.tasks.total ?? 0,
      recentTasks: tasks.slice(0, 5),
    },
    loading:
      boardsLoading ||
      tasksLoading ||
      (usersLoading && (user?.role === "ADMIN" || user?.role === "MANAGER")),
    error: boardsError || tasksError || usersError,
  };
}