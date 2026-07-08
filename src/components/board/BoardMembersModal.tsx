import { Trash } from "lucide-react";
import Button from "../common/Button";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import type { BoardQuery, GetUsersQuery } from "../../gql/graphql";

type BoardType = NonNullable<BoardQuery["board"]>;
type UserListType = GetUsersQuery["users"];

interface BoardMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: BoardType;
  users: UserListType;
  inviteUserId: string;
  setInviteUserId: (id: string) => void;
  inviteRole: "MEMBER" | "VIEWER";
  setInviteRole: (role: "MEMBER" | "VIEWER") => void;
  onInvite: () => void;
  onUpdateRole: (userId: string, role: "MEMBER" | "VIEWER") => void;
  onRemoveMember: (userId: string) => void;
  canManageBoard: boolean;
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

export default function BoardMembersModal({
  isOpen,
  onClose,
  board,
  users,
  inviteUserId,
  setInviteUserId,
  inviteRole,
  setInviteRole,
  onInvite,
  onUpdateRole,
  onRemoveMember,
  canManageBoard,
}: BoardMembersModalProps) {
  const boardMembers = board.members ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Board Members ({boardMembers.length})</DialogTitle>
        </DialogHeader>

        {/* Invite Form (only for board Owner/Admins) */}
        {canManageBoard && (
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Add New Member</h3>
            <div className="flex flex-wrap gap-2">
              <select
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
                className="flex-1 min-w-[200px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer"
              >
                <option value="">Select a user</option>
                {users
                  ?.filter((u) => !boardMembers.some((m) => Number(m.user.id) === Number(u.id)))
                  ?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer"
              >
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <Button
                onClick={onInvite}
                disabled={!inviteUserId}
                className="rounded-2xl px-4 py-2"
              >
                Invite
              </Button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
          {boardMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[10px]">
                    {initials(m.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{m.user.name}</p>
                  <p className="text-xs text-slate-500">{m.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Role selector (only if owner/admin, and not the board owner) */}
                {canManageBoard && m.role !== "OWNER" ? (
                  <>
                    <select
                      value={m.role}
                      onChange={(e) => onUpdateRole(m.user.id, e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/60 cursor-pointer"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => onRemoveMember(m.user.id)}
                      className="rounded-xl p-1 text-danger hover:bg-danger/10 cursor-pointer"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {m.role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
