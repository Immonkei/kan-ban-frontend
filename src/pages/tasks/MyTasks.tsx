import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { AlertTriangle, Inbox, Loader2, ListTodo } from "lucide-react";

import StatePanel from "../../components/common/StatePanel";
import TaskDetailsModal from "../../components/task/TaskDetailsModal";
import { Badge } from "../../components/ui/Badge";

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
        setActiveTask(updatedTask as any);
      }
    },
  });

  const handleUpdate = async (updatedData: any) => {
    if (!activeTask) return;
    await updateTask(activeTask.id, updatedData);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    setActiveTask(null);
  };

  const handleArchive = async (taskId: string) => {
    if (confirm("Archive this task? It will be hidden from the active board.")) {
      await archiveTask(taskId);
      setActiveTask(null);
    }
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Personal Space</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl flex items-center gap-2">
            <ListTodo className="h-8 w-8 text-primary" />
            My Tasks
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            View, update, and collaborate on tasks assigned to you across all project boards.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
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
            onChange={(e) => setPriorityFilter(e.target.value as any)}
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
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Task</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Board</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Due Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {myTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-slate-500 truncate max-w-xs">{task.description}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                    {task.board?.name || "Global"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
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
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={
                      task.priority === "HIGH"
                        ? "destructive"
                        : task.priority === "MEDIUM"
                        ? "warning"
                        : "success"
                    }>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                    {formatDate(task.dueDate) || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveTask(task as any)}
                      className="text-primary hover:text-primary-dark transition hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          onArchiveTask={handleArchive}
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
          onDeleteComment={async (commentId) => {
            if (confirm("Delete this comment?")) {
              await deleteComment(commentId);
            }
          }}
        />
      )}
    </div>
  );
}
