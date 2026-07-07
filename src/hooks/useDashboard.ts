import { useQuery } from "@apollo/client/react";

import {
  BoardsDocument,
  DashboardTasksDocument,
} from "../gql/graphql";


export function useDashboard() {

  const {
    data: boardsData,
    loading: boardsLoading,
  } = useQuery(BoardsDocument);


  const {
    data: tasksData,
    loading: tasksLoading,
  } = useQuery(
    DashboardTasksDocument
  );


  const tasks =
    tasksData?.tasks.data ?? [];


  return {

    dashboard: {

      boards:
        boardsData?.boards.length ?? 0,

      tasks:
        tasksData?.tasks.total ?? 0,


      completed:
        tasks.filter(
          task => task.status === "DONE"
        ).length,


      progress:
        tasks.filter(
          task =>
            task.status === "IN_PROGRESS"
        ).length,


      recentTasks: tasks,

    },


    loading:
      boardsLoading ||
      tasksLoading,
  };
}