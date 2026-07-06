import type { CSSProperties } from "react";
import { type Task } from "../../types/task";

function formatDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

interface TaskCardProps {
  task: Task;
  listeners?: any;
  attributes?: any;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: CSSProperties;
  dragging?: boolean;
}

function TaskCard({ task, attributes, listeners, setNodeRef, style, dragging }: TaskCardProps) {
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md ${
        dragging ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{task.priority}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
          {task.status.replaceAll("_", " ")}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Due {formatDate(task.dueDate) || "N/A"}</span>
        <span>• Created {formatDate(task.createdAt)}</span>
      </div>
    </div>
  );
}

export default TaskCard;
