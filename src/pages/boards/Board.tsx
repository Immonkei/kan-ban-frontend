import { useMemo, useState } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMutation } from "@apollo/client/react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import Button from "../../components/common/Button";
import StatePanel from "../../components/common/StatePanel";
import KanbanColumn from "../../components/task/KanbanColumn";
import TaskForm from "../../components/task/TaskForm";
import { type Task, type TaskStatus } from "../../types/task";

import { useBoard } from "../../hooks/useBoard";
import {
  CreateTaskDocument,
  UpdateTaskDocument,
  DeleteTaskDocument,
} from "../../gql/graphql";

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

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const COLUMNS = STATUS_ORDER.map((status) => ({
  id: status,
  title: status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
}));

export default function Board({ boardId }: { boardId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");

  const { tasks, loading, error, refetch } = useBoard(boardId);

  const [createTask, { loading: creating }] = useMutation(CreateTaskDocument, {
    onCompleted: () => {
      setIsCreating(false);
      refetch();
    },
  });

  const [updateTask] = useMutation(UpdateTaskDocument, {
    onCompleted: () => {
      setEditingTask(null);
      setActiveTask(null);
      refetch();
    },
  });

  const [deleteTask] = useMutation(DeleteTaskDocument, {
    onCompleted: () => {
      setActiveTask(null);
      refetch();
    },
  });

  // Same mutation as `updateTask`, just called with different variables for a
  // pure status change — collapsed into one mutation instance (was duplicated).
  const changeTaskStatus = async (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    await updateTask({ variables: { id: task.id, input: { status } } });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [filteredTasks]);

  const handleCreate = async (newTask: Omit<Task, "id" | "createdAt">) => {
    await createTask({ variables: { input: { ...newTask, boardId } } });
  };

  const handleUpdate = async (updatedData: Omit<Task, "id" | "createdAt">) => {
    if (!editingTask) return;
    await updateTask({ variables: { id: editingTask.id, input: updatedData } });
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask({ variables: { id: taskId } });
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    const currentTask = tasks.find((task) => task.id === activeTaskId);
    if (!currentTask) return;

    // Dropped directly on a column (including an empty one) — KanbanColumn's
    // useDroppable registers the column id itself as a valid drop target.
    const overColumn = COLUMNS.find((column) => column.id === overId);
    if (overColumn) {
      await changeTaskStatus(currentTask, overColumn.id);
      return;
    }

    // Dropped on another task — move into that task's column.
    const targetTask = tasks.find((task) => task.id === overId);
    if (targetTask && targetTask.status !== currentTask.status) {
      await changeTaskStatus(currentTask, targetTask.status);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Kanban Board</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Manage tasks across all columns
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Create tasks, filter work, and move items across your workflow.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setIsCreating((value) => !value);
            setEditingTask(null);
            setActiveTask(null);
          }}
          variant="primary"
          className="rounded-2xl px-5 py-3"
        >
          {isCreating ? "Hide form" : "Create new task"}
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Search tasks</label>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Filter priority</label>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH")}
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
          <p className="mt-3 text-3xl font-semibold text-slate-900">{filteredTasks.length}</p>
          <p className="text-sm text-slate-500">Matching tasks</p>
        </div>
      </div>

      {isCreating ? (
        <div className="mb-8">
          <TaskForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
          {creating ? <p className="mt-4 text-sm text-slate-600">Creating task…</p> : null}
        </div>
      ) : null}

      {loading ? (
        <StatePanel
          icon={<Loader2 className="h-6 w-6 animate-spin" />}
          title="Loading tasks"
          description="Fetching tasks from your boards. This should only take a moment."
        />
      ) : error ? (
        <StatePanel
          icon={<AlertTriangle className="h-6 w-6" />}
          title="Failed to load tasks"
          description="There was an issue loading your tasks. Refresh or try again later."
          actionLabel="Retry"
          onAction={() => void refetch()}
          buttonVariant="secondary"
        />
      ) : filteredTasks.length === 0 ? (
        <StatePanel
          icon={<Inbox className="h-6 w-6" />}
          title="No tasks found"
          description="Try a different search or filter to discover tasks in your board."
        />
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-4">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={tasksByColumn[column.id] ?? []}
                statusOrder={STATUS_ORDER}
                onView={setActiveTask}
                onEdit={(taskToEdit) => {
                  setEditingTask(taskToEdit);
                  setActiveTask(taskToEdit);
                }}
                onMoveLeft={(taskToMove) =>
                  changeTaskStatus(
                    taskToMove,
                    STATUS_ORDER[Math.max(0, STATUS_ORDER.indexOf(taskToMove.status) - 1)]
                  )
                }
                onMoveRight={(taskToMove) =>
                  changeTaskStatus(
                    taskToMove,
                    STATUS_ORDER[Math.min(STATUS_ORDER.length - 1, STATUS_ORDER.indexOf(taskToMove.status) + 1)]
                  )
                }
              />
            ))}
          </div>
        </DndContext>
      )}

      {activeTask ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-10">
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Task details</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeTask.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTask(null);
                  setEditingTask(null);
                }}
                className="text-slate-500 transition hover:text-slate-900"
              >
                ×
              </button>
            </div>

            {editingTask && editingTask.id === activeTask.id ? (
              <div className="mt-6">
                <TaskForm initial={activeTask} onSubmit={handleUpdate} onCancel={() => setEditingTask(null)} />
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{activeTask.status.replaceAll("_", " ")}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Priority</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{activeTask.priority}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Description</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{activeTask.description || "No description added."}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Due date</p>
                    <p className="mt-2 text-sm text-slate-700">{formatDate(activeTask.dueDate) || "No due date"}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Created</p>
                    <p className="mt-2 text-sm text-slate-700">{formatDate(activeTask.createdAt)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Board action</p>
                    <p className="mt-2 text-sm text-slate-700">Open edit or delete below.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setEditingTask(activeTask)}
                    variant="primary"
                    className="rounded-2xl px-4 py-3"
                  >
                    Edit task
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDelete(activeTask.id)}
                    className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition hover:border-danger/40"
                  >
                    Delete task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}