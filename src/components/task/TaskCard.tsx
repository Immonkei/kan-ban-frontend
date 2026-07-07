import type { CSSProperties } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
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

function isOverdue(dueDate: string | null | undefined, status: Task["status"]) {
  if (!dueDate || status === "DONE") return false;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

const PRIORITY_CLASSES: Record<Task["priority"], string> = {
  LOW: "bg-priority-low/10 text-priority-low",
  MEDIUM: "bg-priority-medium/10 text-priority-medium",
  HIGH: "bg-priority-high/10 text-priority-high",
};

const STATUS_CLASSES: Record<Task["status"], string> = {
  TODO: "bg-status-todo/10 text-status-todo",
  IN_PROGRESS: "bg-status-progress/10 text-status-progress",
  REVIEW: "bg-status-review/10 text-status-review",
  DONE: "bg-status-done/10 text-status-done",
};

interface TaskCardProps {
  task: Task;
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: CSSProperties;
  dragging?: boolean;

  onView?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onMoveLeft?: (task: Task) => void;
  onMoveRight?: (task: Task) => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}

function TaskCard({
  task,
  attributes,
  listeners,
  setNodeRef,
  style,
  dragging,
  onView,
  onEdit,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = true,
  canMoveRight = true,
}: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onView?.(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView?.(task);
        }
      }}
      className={`cursor-pointer rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-300 ${
        dragging ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_CLASSES[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${STATUS_CLASSES[task.status]}`}
        >
          {task.status.replaceAll("_", " ")}
        </span>
      </div>

      {task.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{task.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className={overdue ? "font-semibold text-danger" : "text-slate-500"}>
          Due {formatDate(task.dueDate) || "N/A"}
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-500">Created {formatDate(task.createdAt)}</span>
      </div>

      {(onEdit || onMoveLeft || onMoveRight) && (
        <div
          className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"
          // stop clicks on the footer controls from also triggering onView
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canMoveLeft}
              onClick={() => onMoveLeft?.(task)}
              aria-label="Move to previous column"
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!canMoveRight}
              onClick={() => onMoveRight?.(task)}
              aria-label="Move to next column"
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-primary/10 hover:text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default TaskCard;