import { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery } from "@apollo/client/react";
import Button from "../../components/common/Button";
import TaskCard from "../../components/task/TaskCard";
import TaskForm from "../../components/task/TaskForm";
import { type Task, type TaskStatus } from "../../types/task";

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

const TASKS_QUERY = gql`
  query Tasks {
    tasks {
      data {
        id
        title
        description
        status
        priority
        dueDate
        createdAt
      }
    }
  }
`;

const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
    }
  }
`;

const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
    }
  }
`;

const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const UPDATE_TASK_STATUS_MUTATION = gql`
  mutation UpdateTaskStatus($id: ID!, $status: TaskStatus!) {
    updateTaskStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const statusOrder: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

interface SortableTaskCardProps {
  task: Task;
  onView(task: Task): void;
  onEdit(task: Task): void;
  onMoveLeft(task: Task): void;
  onMoveRight(task: Task): void;
}

function SortableTaskCard({ task, onView, onEdit, onMoveLeft, onMoveRight }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard task={task} attributes={attributes} listeners={listeners} dragging={isDragging} />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onView(task)}
          className="rounded-2xl px-3 py-2 text-xs"
        >
          View
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onEdit(task)}
          className="rounded-2xl px-3 py-2 text-xs"
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onMoveLeft(task)}
          disabled={statusOrder.indexOf(task.status) === 0}
          className="rounded-2xl px-3 py-2 text-xs"
        >
          ←
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onMoveRight(task)}
          disabled={statusOrder.indexOf(task.status) === statusOrder.length - 1}
          className="rounded-2xl px-3 py-2 text-xs"
        >
          →
        </Button>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");

  const { data, loading, error, refetch } = useQuery<{ tasks: { data: Task[] } }>(TASKS_QUERY);

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK_MUTATION, {
    onCompleted: () => {
      setIsCreating(false);
      refetch();
    },
  });

  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    onCompleted: () => {
      setEditingTask(null);
      setActiveTask(null);
      refetch();
    },
  });

  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    onCompleted: () => {
      setActiveTask(null);
      refetch();
    },
  });

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS_MUTATION, {
    onCompleted: () => {
      refetch();
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tasks = data?.tasks?.data ?? [];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const columns: { id: TaskStatus; title: string }[] = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "REVIEW", title: "Review" },
    { id: "DONE", title: "Done" },
  ];

  const tasksByColumn = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [columns, filteredTasks]);

  const handleCreate = async (newTask: Omit<Task, "id" | "createdAt">) => {
    await createTask({ variables: { input: newTask } });
  };

  const handleUpdate = async (updatedData: Omit<Task, "id" | "createdAt">) => {
    if (!editingTask) return;

    await updateTask({
      variables: {
        id: editingTask.id,
        input: updatedData,
      },
    });
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask({ variables: { id: taskId } });
  };

  const changeTaskStatus = async (task: Task, status: TaskStatus) => {
    if (task.status === status) return;

    await updateTaskStatus({
      variables: {
        id: task.id,
        status,
      },
    });
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    const currentTask = tasks.find((task) => task.id === activeTaskId);
    if (!currentTask) return;

    const overColumn = columns.find((column) => column.id === overId);
    if (overColumn) {
      await changeTaskStatus(currentTask, overColumn.id);
      return;
    }

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
          {creating ? (
            <p className="mt-4 text-sm text-slate-600">Creating task…</p>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Loading tasks...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm">
          Failed to load tasks.
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          No tasks match the current filters. Adjust search or priority to continue.
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-4">
            {columns.map((column) => (
              <section key={column.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{column.title}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {tasksByColumn[column.id]?.length || 0} tasks
                    </p>
                  </div>
                </div>

                <SortableContext items={tasksByColumn[column.id].map((task) => task.id)} strategy={rectSortingStrategy}>
                  <div className="space-y-4">
                    {tasksByColumn[column.id].map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onView={setActiveTask}
                        onEdit={(taskToEdit) => {
                          setEditingTask(taskToEdit);
                          setActiveTask(taskToEdit);
                        }}
                        onMoveLeft={(taskToMove) => changeTaskStatus(taskToMove, statusOrder[Math.max(0, statusOrder.indexOf(taskToMove.status) - 1)])}
                        onMoveRight={(taskToMove) => changeTaskStatus(taskToMove, statusOrder[Math.min(statusOrder.length - 1, statusOrder.indexOf(taskToMove.status) + 1)])}
                      />
                    ))}
                  </div>
                </SortableContext>
              </section>
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
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
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
