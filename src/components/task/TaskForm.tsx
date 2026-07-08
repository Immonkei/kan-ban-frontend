import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../common/Button";
import { type Task } from "../../types/task";

interface TaskFormProps {
  initial?: Partial<Task>;
  onSubmit(task: Omit<Task, "id" | "createdAt" | "assignee" | "isArchived" | "creator" | "comments">): void;
  onCancel?(): void;
}

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().optional().default(""),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional().default(""),
});

export default function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      status: initial?.status ?? "TODO",
      priority: initial?.priority ?? "MEDIUM",
      dueDate: (() => {
        if (!initial?.dueDate) return "";
        const num = Number(initial.dueDate);
        const d = !Number.isNaN(num) && String(num) === initial.dueDate.trim() ? new Date(num) : new Date(initial.dueDate);
        return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
      })(),
    },
  });

  const onSubmitForm = (data: z.input<typeof taskSchema>) => {
    onSubmit({
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          type="text"
          {...register("title")}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
        />
        {errors.title ? (
          <p className="mt-1 text-xs text-danger">{errors.title.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          {...register("description")}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          rows={4}
        />
        {errors.description ? (
          <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-status">
            Status
          </label>
          <select
            id="task-status"
            {...register("status")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
          {errors.status ? (
            <p className="mt-1 text-xs text-danger">{errors.status.message}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            {...register("priority")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          {errors.priority ? (
            <p className="mt-1 text-xs text-danger">{errors.priority.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-duedate">
          Due date
        </label>
        <input
          id="task-duedate"
          type="date"
          {...register("dueDate")}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
        />
        {errors.dueDate ? (
          <p className="mt-1 text-xs text-danger">{errors.dueDate.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="rounded-2xl"
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" className="rounded-2xl">
          Save task
        </Button>
      </div>
    </form>
  );
}
