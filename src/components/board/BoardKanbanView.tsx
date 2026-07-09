import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import StatePanel from "../common/StatePanel";
import KanbanColumn from "../task/KanbanColumn";
import { type Task, type TaskStatus } from "../../types/task";

export interface BoardKanbanViewProps {
    loading: boolean;
    error: Error | undefined;
    filteredTasks: Task[];
    tasksByColumn: Record<TaskStatus, Task[]>;
    columns: { id: TaskStatus; title: string }[];
    statusOrder: TaskStatus[];
    canEditTasks: boolean;
    isBoardOwner: boolean;
    currentUserId?: string;
    setActiveTask: (task: Task | null) => void;
    setEditingTask: (task: Task | null) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    changeTaskStatus: (task: Task, status: TaskStatus) => Promise<unknown>;
    refetch: () => Promise<unknown>;
    clearFilters: () => void;
}

export default function BoardKanbanView({
    loading,
    error,
    filteredTasks,
    tasksByColumn,
    columns,
    statusOrder,
    canEditTasks,
    isBoardOwner,
    currentUserId,
    setActiveTask,
    setEditingTask,
    handleDragEnd,
    changeTaskStatus,
    refetch,
    clearFilters,
}: BoardKanbanViewProps) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    if (loading) {
        return (
            <StatePanel
                icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
                title="Loading tasks"
                description="Fetching tasks from your boards. This should only take a moment."
            />
        );
    }

    if (error) {
        return (
            <StatePanel
                icon={<AlertTriangle className="h-6 w-6 text-danger" />}
                title="Failed to load tasks"
                description="There was an issue loading your tasks. Refresh or try again later."
                actionLabel="Retry"
                onAction={() => void refetch()}
                buttonVariant="secondary"
            />
        );
    }

    if (filteredTasks.length === 0) {
        return (
            <StatePanel
                icon={<Inbox className="h-6 w-6 text-slate-400" />}
                title="No tasks found"
                description="Try a different search or filter to discover tasks in your board."
                actionLabel="Clear filters"
                onAction={clearFilters}
                buttonVariant="secondary"
            />
        );
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid gap-6 lg:grid-cols-4">
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        tasks={tasksByColumn[column.id] ?? []}
                        statusOrder={statusOrder}
                        onView={setActiveTask}
                        onEdit={
                            canEditTasks
                                ? (taskToEdit) => {
                                    setEditingTask(taskToEdit);
                                    setActiveTask(taskToEdit);
                                }
                                : undefined
                        }
                        onMoveLeft={(taskToMove) =>
                            changeTaskStatus(
                                taskToMove,
                                statusOrder[Math.max(0, statusOrder.indexOf(taskToMove.status) - 1)]
                            )
                        }
                        onMoveRight={(taskToMove) =>
                            changeTaskStatus(
                                taskToMove,
                                statusOrder[Math.min(statusOrder.length - 1, statusOrder.indexOf(taskToMove.status) + 1)]
                            )
                        }
                        disabled={!canEditTasks}
                        currentUserId={currentUserId}
                        isBoardOwner={isBoardOwner}
                    />
                ))}
            </div>
        </DndContext>
    );
}
