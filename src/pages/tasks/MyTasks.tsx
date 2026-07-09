import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { AlertTriangle, Inbox, Loader2, ListTodo } from "lucide-react";

import StatePanel from "../../components/common/StatePanel";
import TaskDetailsModal from "../../components/task/TaskDetailsModal";
import { Badge } from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table";
import { Input } from "../../components/ui/Input";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";

import { useAuth } from "../../hooks/useAuth";
import { useTaskOperations } from "../../hooks/useTaskOperations";
import { useComments } from "../../hooks/useComments";

import { TasksDocument } from "../../gql/graphql";
import { type Task, type TaskStatus } from "../../types/task";

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const num = Number(value);
  const date = !Number.isNaN(num) && String(num) === value.trim() ? new Date(num) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function MyTasks() {
  const { user } = useAuth();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");

  // Confirmation dialog states
  const [taskToArchive, setTaskToArchive] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Comments states
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const { data, loading, error, refetch } = useQuery(TasksDocument, {
    variables: {
      page: 1,
      limit: 100, // Fetch up to 100 tasks assigned to user's boards
    },
  });

  // Filter tasks client-side to only show tasks assigned to the current user
  const myTasks = useMemo(() => {
    if (!data?.tasks?.data || !user) return [];
    return data.tasks.data.filter((task) => {
      const isAssignedToMe = Number(task.assignee?.id) === Number(user.id);

      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;

      return isAssignedToMe && matchesSearch && matchesStatus && matchesPriority;
    });
  }, [data, user, search, statusFilter, priorityFilter]);

  const {
    updateTask,
    deleteTask,
    archiveTask,
    assignTask,
    changeTaskStatus,
  } = useTaskOperations({
    onSuccess: () => {
      refetch();
    },
    onAssignSuccess: (assignee) => {
      if (activeTask) {
        setActiveTask({ ...activeTask, assignee });
      }
    },
  });

  const { addComment, updateComment, deleteComment } = useComments({
    onSuccess: async () => {
      const res = await refetch();
      const updatedTask = res.data?.tasks?.data?.find((t) => t.id === activeTask?.id);
      if (updatedTask) {
        setActiveTask(updatedTask as unknown as Task);
      }
    },
  });

  const handleUpdate = async (updatedData: Omit<
    Task,
    "id" | "createdAt" | "assignee" | "isArchived" | "creator" | "comments"
  >) => {
    if (!activeTask) return;
    await updateTask(activeTask.id, updatedData);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    setActiveTask(null);
  };

  const handleArchiveClick = (taskId: string) => {
    setTaskToArchive(taskId);
  };

  const handleConfirmArchive = async () => {
    if (!taskToArchive) return;
    await archiveTask(taskToArchive);
    setActiveTask(null);
    setTaskToArchive(null);
  };

  const handleDeleteCommentClick = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    await deleteComment(commentToDelete);
    setCommentToDelete(null);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
          title="Loading My Tasks"
          description="Fetching your assigned tasks..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<AlertTriangle className="h-6 w-6 text-danger" />}
          title="Failed to load tasks"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <PageHeader
        label="Personal Space"
        title={
          <span className="flex items-center gap-2 select-none">
            <ListTodo className="h-8 w-8 text-primary" />
            My Tasks
          </span>
        }
        description="View, update, and collaborate on tasks assigned to you across all project boards."
      />

      {/* Filters Bar */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="bg-slate-55"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | TaskStatus)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <option value="ALL">All statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {myTasks.length === 0 ? (
        <StatePanel
          icon={<Inbox className="h-6 w-6 text-slate-400" />}
          title="No tasks assigned"
          description="You don't have any matching tasks assigned to you in this workspace."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setStatusFilter("ALL");
            setPriorityFilter("ALL");
          }}
          buttonVariant="secondary"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-slate-500 truncate max-w-xs">{task.description}</div>
                  )}
                </TableCell>
                <TableCell>
                  {task.board?.name || "Global"}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    task.status === "DONE"
                      ? "success"
                      : task.status === "REVIEW"
                        ? "warning"
                        : task.status === "IN_PROGRESS"
                          ? "info"
                          : "secondary"
                  }>
                    {task.status.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    task.priority === "HIGH"
                      ? "destructive"
                      : task.priority === "MEDIUM"
                        ? "warning"
                        : "success"
                  }>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(task.dueDate) || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => setActiveTask(task as unknown as Task)}
                    className="text-primary hover:text-primary-dark transition hover:underline"
                  >
                    View Details
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {activeTask && (
        <TaskDetailsModal
          activeTask={activeTask}
          setActiveTask={setActiveTask}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          canEditTasks={true}
          canManageBoard={user?.role === "ADMIN"}
          userBoardRole="MEMBER"
          userGlobalRole={user?.role}
          currentUserId={user?.id}
          boardMembers={[]} // Member selection is not required from My Tasks view as task is already assigned to the user
          onAssignTask={assignTask}
          onChangeTaskStatus={changeTaskStatus}
          onUpdateTask={handleUpdate}
          onArchiveTask={handleArchiveClick}
          onDeleteTask={handleDelete}

          commentInput={commentInput}
          setCommentInput={setCommentInput}
          onPostComment={async (e) => {
            e.preventDefault();
            if (!commentInput.trim()) return;
            await addComment(activeTask.id, commentInput);
            setCommentInput("");
          }}
          editingCommentId={editingCommentId}
          setEditingCommentId={setEditingCommentId}
          editingCommentText={editingCommentText}
          setEditingCommentText={setEditingCommentText}
          onSaveEditComment={async (commentId) => {
            if (!editingCommentText.trim()) return;
            await updateComment(commentId, editingCommentText);
            setEditingCommentId(null);
          }}
          onDeleteComment={handleDeleteCommentClick}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={!!taskToArchive}
        onClose={() => setTaskToArchive(null)}
        onConfirm={handleConfirmArchive}
        title="Archive task"
        description="Are you sure you want to archive this task? It will be hidden from the active board."
        confirmLabel="Archive"
        variant="warning"
      />

      <ConfirmationDialog
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleConfirmDeleteComment}
        title="Delete comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

