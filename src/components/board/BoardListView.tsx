import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import StatePanel from "../common/StatePanel";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import Pagination from "../ui/Pagination";
import { type TasksQuery } from "../../gql/graphql";
import { type Task } from "../../types/task";

interface BoardListViewProps {
    loading: boolean;
    error: Error | undefined;
    listData: TasksQuery | undefined;
    currentPage: number;
    limitPerPage: number;
    onPageChange: (page: number) => void;
    setActiveTask: (task: Task | null) => void;
    refetchList: () => Promise<unknown>;
    clearFilters: () => void;
}

function formatDate(value: string | null | undefined) {
    if (!value) return "";
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "";
    }
}

export default function BoardListView({
    loading,
    error,
    listData,
    currentPage,
    limitPerPage,
    onPageChange,
    setActiveTask,
    refetchList,
    clearFilters,
}: BoardListViewProps) {
    if (loading) {
        return (
            <StatePanel
                icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
                title="Loading task list"
                description="Querying server-side paginated tasks..."
            />
        );
    }

    if (error) {
        return (
            <StatePanel
                icon={<AlertTriangle className="h-6 w-6 text-danger" />}
                title="Failed to load task list"
                description={error.message}
                actionLabel="Retry"
                onAction={() => void refetchList()}
                buttonVariant="secondary"
            />
        );
    }

    if (!listData?.tasks || listData.tasks.data.length === 0) {
        return (
            <StatePanel
                icon={<Inbox className="h-6 w-6 text-slate-400" />}
                title="No tasks found"
                description="Try a different search or filter to discover tasks in your workspace."
                actionLabel="Clear filters"
                onAction={clearFilters}
                buttonVariant="secondary"
            />
        );
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {listData.tasks.data.map((task) => (
                        <TableRow key={task.id}>
                            <TableCell>
                                <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                                {task.description && (
                                    <div className="text-xs text-slate-500 truncate max-w-xs text-ellipsis overflow-hidden">
                                        {task.description}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={
                                    task.status === "DONE"
                                        ? "success"
                                        : task.status === "REVIEW"
                                            ? "warning"
                                            : task.status === "IN_PROGRESS"
                                                ? "info"
                                                : "secondary"
                                }>
                                    {task.status.replaceAll("_", " ")}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={
                                    task.priority === "HIGH"
                                        ? "destructive"
                                        : task.priority === "MEDIUM"
                                            ? "warning"
                                            : "success"
                                }>
                                    {task.priority}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {formatDate(task.dueDate) || "-"}
                            </TableCell>
                            <TableCell>
                                {task.assignee?.name || "Unassigned"}
                            </TableCell>
                            <TableCell className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setActiveTask(task as unknown as Task)}
                                    className="text-primary hover:text-primary-dark transition hover:underline"
                                >
                                    View Details
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination
                currentPage={currentPage}
                totalPages={listData.tasks.totalPages}
                totalItems={listData.tasks.total}
                limitPerPage={limitPerPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}
