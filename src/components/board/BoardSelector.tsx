import { Users } from "lucide-react";
import Button from "../common/Button";
import type { BoardsQuery } from "../../gql/graphql";

type BoardListType = BoardsQuery["boards"];

interface BoardSelectorProps {
  boards: BoardListType;
  boardId: string;
  onSelectBoard: (value: string) => void;
  onRenameBoard: () => void;
  onArchiveBoard: () => void;
  onDeleteBoard: () => void;
  onManageMembers: () => void;
  canManageBoard: boolean;
  hasMembersAccess: boolean;
  boardOwnerName?: string;
  canCreateBoard: boolean;
}

export default function BoardSelector({
  boards,
  boardId,
  onSelectBoard,
  onRenameBoard,
  onArchiveBoard,
  onDeleteBoard,
  onManageMembers,
  canManageBoard,
  hasMembersAccess,
  boardOwnerName,
  canCreateBoard,
}: BoardSelectorProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
      <div className="flex flex-wrap items-center gap-3">
        <label
          className="text-sm font-semibold text-slate-500 uppercase tracking-wider"
          htmlFor="board-select"
        >
          Board:
        </label>
        <select
          id="board-select"
          value={boardId}
          onChange={(e) => onSelectBoard(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer"
        >
          <option value="" disabled>
            Select a board
          </option>
          {boards
            .filter((b: any) => !b.isArchived)
            .map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          {canCreateBoard && (
            <option value="CREATE_NEW">+ Create New Board</option>
          )}
        </select>

        {hasMembersAccess && (
          <Button
            variant="secondary"
            onClick={onManageMembers}
            className="rounded-2xl py-1.5 px-3 text-xs inline-flex items-center gap-1"
          >
            <Users className="h-3.5 w-3.5" />
            Members
          </Button>
        )}

        {canManageBoard && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onRenameBoard}
              className="rounded-2xl py-1.5 px-3 text-xs"
            >
              Rename
            </Button>
            <Button
              variant="secondary"
              onClick={onArchiveBoard}
              className="rounded-2xl py-1.5 px-3 text-xs border-amber-200 text-amber-600 hover:bg-amber-50"
            >
              Archive
            </Button>
            <Button
              variant="secondary"
              onClick={onDeleteBoard}
              className="rounded-2xl py-1.5 px-3 text-xs border-danger/20 text-danger hover:bg-danger/5 hover:border-danger/30"
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {boardOwnerName && (
        <p className="text-xs text-slate-500 font-medium">
          Owner: <span className="font-semibold text-slate-700">{boardOwnerName}</span>
        </p>
      )}
    </div>
  );
}
