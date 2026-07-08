import Button from "../common/Button";

interface BoardHeaderProps {
  boardName: string;
  isCreating: boolean;
  setIsCreating: (value: boolean | ((val: boolean) => boolean)) => void;
  setEditingTask: (task: any | null) => void;
  setActiveTask: (task: any | null) => void;
  canEditTasks: boolean;
}

export default function BoardHeader({
  boardName,
  isCreating,
  setIsCreating,
  setEditingTask,
  setActiveTask,
  canEditTasks,
}: BoardHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Kanban Board
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {boardName}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Create tasks, filter work, and move items across your workflow.
        </p>
      </div>

      {canEditTasks && (
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
      )}
    </div>
  );
}
