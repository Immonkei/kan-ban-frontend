import { Input } from "../ui/Input";

interface TaskFilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  priorityFilter: "ALL" | "LOW" | "MEDIUM" | "HIGH";
  setPriorityFilter: (value: "ALL" | "LOW" | "MEDIUM" | "HIGH") => void;
  resultsCount: number;
  viewMode: "BOARD" | "LIST";
  setViewMode: (value: "BOARD" | "LIST") => void;
}

export default function TaskFilterBar({
  search,
  setSearch,
  priorityFilter,
  setPriorityFilter,
  resultsCount,
  viewMode,
  setViewMode,
}: TaskFilterBarProps) {
  return (
    <>
      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("BOARD")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              viewMode === "BOARD"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Kanban Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode("LIST")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              viewMode === "LIST"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Task List
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Search tasks
          </label>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Filter priority
          </label>
          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH")
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Results</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{resultsCount}</p>
          <p className="text-sm text-slate-500">Matching tasks</p>
        </div>
      </div>
    </>
  );
}
