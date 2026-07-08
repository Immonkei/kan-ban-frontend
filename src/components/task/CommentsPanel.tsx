import { MessageSquare, Send } from "lucide-react";
import Button from "../common/Button";

interface CommentUser {
  id: string;
  name: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

interface CommentsPanelProps {
  comments: Comment[];
  commentInput: string;
  setCommentInput: (value: string) => void;
  onPostComment: (e: any) => void | Promise<void>;
  editingCommentId: string | null;
  setEditingCommentId: (value: string | null) => void;
  editingCommentText: string;
  setEditingCommentText: (value: string) => void;
  onSaveEditComment: (commentId: string) => void | Promise<void>;
  onDeleteComment: (commentId: string) => void | Promise<void>;
  currentUserId?: string;
  userBoardRole?: string;
  userGlobalRole?: string;
}

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

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function CommentsPanel({
  comments,
  commentInput,
  setCommentInput,
  onPostComment,
  editingCommentId,
  setEditingCommentId,
  editingCommentText,
  setEditingCommentText,
  onSaveEditComment,
  onDeleteComment,
  currentUserId,
  userBoardRole,
  userGlobalRole,
}: CommentsPanelProps) {
  return (
    <div className="border-t border-slate-200 pt-6">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-slate-500" />
        Discussion ({comments?.length ?? 0})
      </h3>

      {/* Comment Input */}
      <form onSubmit={onPostComment} className="flex gap-2">
        <input
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Ask a question or post an update..."
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
        />
        <Button type="submit" className="rounded-2xl px-4 py-2">
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Comment Feed */}
      <div className="mt-6 space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {comments && comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
                    {initials(c.user.name)}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">{c.user.name}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                </div>

                {/* Comment Edit/Delete Actions */}
                {(Number(c.user.id) === Number(currentUserId) ||
                  userGlobalRole === "ADMIN" ||
                  userBoardRole === "OWNER") && (
                  <div className="flex items-center gap-1.5">
                    {editingCommentId !== c.id && Number(c.user.id) === Number(currentUserId) && (
                      <button
                        onClick={() => {
                          setEditingCommentId(c.id);
                          setEditingCommentText(c.content);
                        }}
                        className="text-[10px] font-semibold text-slate-500 hover:text-primary transition"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="text-[10px] font-semibold text-danger hover:underline transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingCommentId === c.id ? (
                <div className="mt-2 flex gap-2">
                  <input
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/60"
                  />
                  <Button
                    onClick={() => onSaveEditComment(c.id)}
                    className="rounded-xl px-2 py-1 text-[10px]"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingCommentId(null)}
                    className="rounded-xl px-2 py-1 text-[10px]"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 italic">
            No comments yet. Start the conversation!
          </p>
        )}
      </div>
    </div>
  );
}
