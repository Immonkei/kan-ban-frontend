import Button from "../common/Button";
import TaskForm from "./TaskForm";
import CommentsPanel from "./CommentsPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import type { Task, TaskStatus } from "../../types/task";
import type { BoardQuery } from "../../gql/graphql";

type BoardMembersType = NonNullable<BoardQuery["board"]>["members"];

interface TaskDetailsModalProps {
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  canEditTasks: boolean;
  canManageBoard: boolean;
  userBoardRole?: string;
  userGlobalRole?: string;
  currentUserId?: string;
  boardMembers: BoardMembersType;
  onAssignTask: (taskId: string, userId: string, selectedMemberUser: any) => void | Promise<any>;
  onChangeTaskStatus: (task: Task, status: TaskStatus) => void | Promise<any>;
  onUpdateTask: (updatedData: any) => void | Promise<void>;
  onArchiveTask: (taskId: string) => void | Promise<void>;
  onDeleteTask: (taskId: string) => void | Promise<void>;
  
  // comments panel forwarding props
  commentInput: string;
  setCommentInput: (value: string) => void;
  onPostComment: (e: any) => void | Promise<void>;
  editingCommentId: string | null;
  setEditingCommentId: (value: string | null) => void;
  editingCommentText: string;
  setEditingCommentText: (value: string) => void;
  onSaveEditComment: (commentId: string) => void | Promise<void>;
  onDeleteComment: (commentId: string) => void | Promise<void>;
}

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

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

export default function TaskDetailsModal({
  activeTask,
  setActiveTask,
  editingTask,
  setEditingTask,
  canEditTasks,
  canManageBoard,
  userBoardRole,
  userGlobalRole,
  currentUserId,
  boardMembers,
  onAssignTask,
  onChangeTaskStatus,
  onUpdateTask,
  onArchiveTask,
  onDeleteTask,
  
  commentInput,
  setCommentInput,
  onPostComment,
  editingCommentId,
  setEditingCommentId,
  editingCommentText,
  setEditingCommentText,
  onSaveEditComment,
  onDeleteComment,
}: TaskDetailsModalProps) {
  if (!activeTask) return null;

  return (
    <Dialog open={!!activeTask} onOpenChange={(open) => { if (!open) { setActiveTask(null); setEditingTask(null); } }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto pr-6">
        <DialogHeader>
          <DialogTitle>{activeTask.title}</DialogTitle>
        </DialogHeader>

        {editingTask && editingTask.id === activeTask.id ? (
          <div className="mt-2">
            <TaskForm
              initial={activeTask}
              onSubmit={onUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                  Status
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {activeTask.status.replaceAll("_", " ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {STATUS_ORDER.map((s) => {
                    const canMove =
                      canEditTasks &&
                      (userGlobalRole === "ADMIN" ||
                        userGlobalRole === "MANAGER" ||
                        userBoardRole === "OWNER" ||
                        Number(activeTask.assignee?.id) === Number(currentUserId));
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={activeTask.status === s || !canMove}
                        onClick={async () => {
                          await onChangeTaskStatus(activeTask, s);
                          setActiveTask({ ...activeTask, status: s });
                        }}
                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          activeTask.status === s
                            ? "bg-primary text-white cursor-default"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        }`}
                      >
                        {s.replaceAll("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                  Priority
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {activeTask.priority}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                Description
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {activeTask.description || "No description added."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                  Due date
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {formatDate(activeTask.dueDate) || "No due date"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                  Created
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {formatDate(activeTask.createdAt)}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                  Creator
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {activeTask.creator?.name || "System"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                  Assignee
                </p>
                {canEditTasks ? (
                  <select
                    value={activeTask.assignee?.id ?? ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (val) {
                        const selectedMember = boardMembers?.find((m) => m.user.id === val);
                        await onAssignTask(
                          activeTask.id,
                          val,
                          selectedMember ? selectedMember.user : null
                        );
                      }
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/60 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {boardMembers?.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 text-sm text-slate-700">
                    {activeTask.assignee?.name || "Unassigned"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {canEditTasks && (
                <Button
                  type="button"
                  onClick={() => setEditingTask(activeTask)}
                  variant="primary"
                  className="rounded-2xl px-4 py-3"
                >
                  Edit task
                </Button>
              )}
              {canEditTasks && (
                <button
                  type="button"
                  onClick={() => onArchiveTask(activeTask.id)}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-600 transition hover:border-amber-400 cursor-pointer"
                >
                  Archive task
                </button>
              )}
              {canManageBoard && (
                <button
                  type="button"
                  onClick={() => onDeleteTask(activeTask.id)}
                  className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition hover:border-danger/40 cursor-pointer"
                >
                  Delete task
                </button>
              )}
            </div>

            {/* Comments discussions panel */}
            <CommentsPanel
              comments={(activeTask as any).comments ?? []}
              commentInput={commentInput}
              setCommentInput={setCommentInput}
              onPostComment={onPostComment}
              editingCommentId={editingCommentId}
              setEditingCommentId={setEditingCommentId}
              editingCommentText={editingCommentText}
              setEditingCommentText={setEditingCommentText}
              onSaveEditComment={onSaveEditComment}
              onDeleteComment={onDeleteComment}
              currentUserId={currentUserId}
              userBoardRole={userBoardRole}
              userGlobalRole={userGlobalRole}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
