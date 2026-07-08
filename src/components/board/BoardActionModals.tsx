import type { RefObject } from "react";
import Button from "../common/Button";
import { Input } from "../ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";

interface BoardActionModalsProps {
  boardModal:
    | { type: "create" }
    | { type: "rename"; currentName: string }
    | { type: "delete" }
    | { type: "archive" }
    | null;
  setBoardModal: (value: any | null) => void;
  boardName?: string;
  boardModalInputRef: RefObject<HTMLInputElement | null>;
  boardModalInput: string;
  setBoardModalInput: (value: string) => void;
  onConfirm: () => void | Promise<void>;
}

export default function BoardActionModals({
  boardModal,
  setBoardModal,
  boardName,
  boardModalInputRef,
  boardModalInput,
  setBoardModalInput,
  onConfirm,
}: BoardActionModalsProps) {
  if (!boardModal) return null;

  return (
    <Dialog open={!!boardModal} onOpenChange={(open) => { if (!open) setBoardModal(null); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {boardModal.type === "create"
              ? "Create new board"
              : boardModal.type === "rename"
              ? "Rename board"
              : boardModal.type === "archive"
              ? "Archive board"
              : "Delete board"}
          </DialogTitle>
        </DialogHeader>

        {boardModal.type === "delete" ? (
          <>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">{boardName}</span>? All
              tasks on this board will be permanently removed.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-2xl bg-danger/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-danger cursor-pointer"
              >
                Delete board
              </button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBoardModal(null)}
                className="flex-1 justify-center rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : boardModal.type === "archive" ? (
          <>
            <p className="text-sm text-slate-600">
              Are you sure you want to archive{" "}
              <span className="font-semibold text-slate-900">{boardName}</span>? It
              will be removed from your active workspace.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 cursor-pointer"
              >
                Archive board
              </button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBoardModal(null)}
                className="flex-1 justify-center rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-2">
              <label
                htmlFor="board-modal-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Board name
              </label>
              <Input
                id="board-modal-name"
                ref={boardModalInputRef as any}
                type="text"
                value={boardModalInput}
                onChange={(e) => setBoardModalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void onConfirm();
                  if (e.key === "Escape") setBoardModal(null);
                }}
                placeholder="e.g. Q3 Roadmap"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="primary"
                onClick={onConfirm}
                disabled={!boardModalInput.trim()}
                className="flex-1 justify-center rounded-2xl"
              >
                {boardModal.type === "create" ? "Create" : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBoardModal(null)}
                className="flex-1 justify-center rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
