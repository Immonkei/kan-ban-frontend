import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import ShareButton from "../../components/common/ShareButton";

type BoardTask = {
  id: string;
  status: string;
};

type Board = {
  id: string;
  name: string;
  tasks: BoardTask[];
};

type Task = {
  id: string;
  title: string;
  status: string;
};

type TaskConnection = {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type DashboardOverviewData = {
  boards: Board[];
  tasks: TaskConnection;
};

const DASHBOARD_OVERVIEW_QUERY = gql`
  query DashboardOverview {
    boards {
      id
      name
      tasks {
        id
        status
      }
    }
    tasks {
      data {
        id
        title
        status
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error } = useQuery<DashboardOverviewData>(
    DASHBOARD_OVERVIEW_QUERY,
    {
      skip: authLoading,
      fetchPolicy: "network-only",
    }
  );

  const boards = data?.boards ?? [];
  const tasks = data?.tasks?.data ?? [];
  const boardsCount = boards.length;
  const tasksCount = tasks.length;
  const membersCount = 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Welcome back{user?.name ? `, ${user.name}` : "."}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          This is your task manager overview. Track boards, tasks, and progress from one place.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">Boards</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {loading ? "..." : boardsCount}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Create and organize your project boards.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">Tasks</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {loading ? "..." : tasksCount}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Track tasks across all active boards.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">Members</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {membersCount}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Collaborators on your current workspace.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">Status</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {loading ? "..." : error ? "Error" : "Live"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {error
              ? "There was a problem loading your dashboard data."
              : "Recent data from your boards and tasks."}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
              <p className="mt-2 text-sm text-slate-600">
                Start a new board, add a task, or invite teammates.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Button
              type="button"
              variant="primary"
              className="rounded-2xl bg-slate-900 px-4 py-3 hover:bg-slate-800"
            >
              New board
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl px-4 py-3"
            >
              Add task
            </Button>
            <ShareButton label="Invite team" />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Latest boards</h2>
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">
              Loading boards...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-3xl bg-rose-50 p-6 text-sm text-rose-700">
              Unable to load boards.
            </div>
          ) : boardsCount === 0 ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">
              No boards available yet.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {boards.slice(0, 3).map((board) => (
                <div
                  key={board.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900">{board.name}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                      {board.tasks?.length ?? 0} tasks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
