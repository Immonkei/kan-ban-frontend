import TaskRow from "./TaskRow";
import EmptyState from "./EmptyState";

import type {
  TasksQuery,
} from "../../gql/graphql";


type RecentTask =
  TasksQuery["tasks"]["data"][number];


interface Props {
  tasks: RecentTask[];
}


export default function RecentTasks({
  tasks,
}: Props) {

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-lg font-semibold text-slate-900">
        Recent Tasks
      </h2>


      <div className="mt-4 space-y-3">

        {tasks.length === 0 ? (

          <EmptyState
            title="No tasks yet"
            description="Create your first task to get started."
          />

        ) : (

          tasks.map((task)=>(
            <TaskRow
              key={task.id}
              title={task.title}
              board={task.board.name}
              status={task.status}
              priority={task.priority}
            />
          ))

        )}

      </div>

    </div>
  );
}