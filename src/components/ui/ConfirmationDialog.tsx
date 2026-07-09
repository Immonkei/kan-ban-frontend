import Button from "../common/Button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./Dialog";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "primary";
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "primary",
}: ConfirmationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-slate-600">{description}</p>

                <div className="flex gap-3 mt-4">
                    <button
                        type="button"
                        onClick={async () => {
                            await onConfirm();
                            onClose();
                        }}
                        className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition cursor-pointer ${variant === "danger"
                                ? "bg-danger hover:bg-danger/90"
                                : variant === "warning"
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "bg-primary hover:bg-primary/95"
                            }`}
                    >
                        {confirmLabel}
                    </button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        {cancelLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
