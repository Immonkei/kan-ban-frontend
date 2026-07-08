import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import SortableTaskCard from "./SortableTaskcard";
import { type Task, type TaskStatus } from "../../types/task";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  statusOrder: TaskStatus[];
  onView: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onMoveLeft?: (task: Task) => void;
  onMoveRight?: (task: Task) => void;
  disabled?: boolean;
  currentUserId?: string;
  isBoardOwner?: boolean;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  statusOrder,
  onView,
  onEdit,
  onMoveLeft,
  onMoveRight,
  disabled,
  currentUserId,
  isBoardOwner = false,
}: KanbanColumnProps) {
  // Registers the column itself (not just its tasks) as a drop target, so
  // dragging a card onto an EMPTY column works. Without this, only dropping
  // directly onto another task's sortable area would trigger a status change.
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-3xl border p-5 shadow-sm transition ${
        isOver ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            {tasks.length} tasks
          </p>
        </div>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={rectSortingStrategy}>
        <div className="min-h-[96px] space-y-4">
          {tasks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
              Drop a task here
            </p>
          ) : (
            tasks.map((task) => {
              const canUserModify = !disabled && (
                currentUserId === undefined || 
                isBoardOwner || 
                Number(task.assignee?.id) === Number(currentUserId)
              );
              return (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onView={onView}
                  onEdit={canUserModify ? onEdit : undefined}
                  onMoveLeft={canUserModify ? onMoveLeft : undefined}
                  onMoveRight={canUserModify ? onMoveRight : undefined}
                  canMoveLeft={statusOrder.indexOf(task.status) > 0}
                  canMoveRight={statusOrder.indexOf(task.status) < statusOrder.length - 1}
                  disabled={!canUserModify}
                />
              );
            })
          )}
        </div>
      </SortableContext>
    </section>
  );
}