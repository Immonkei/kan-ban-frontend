import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useQuery } from "@apollo/client/react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

import Button from "../../components/common/Button";
import StatePanel from "../../components/common/StatePanel";
import KanbanColumn from "../../components/task/KanbanColumn";
import TaskForm from "../../components/task/TaskForm";

import BoardHeader from "../../components/board/BoardHeader";
import BoardSelector from "../../components/board/BoardSelector";
import BoardMembersModal from "../../components/board/BoardMembersModal";
import BoardActionModals from "../../components/board/BoardActionModals";
import TaskFilterBar from "../../components/task/TaskFilterBar";
import TaskDetailsModal from "../../components/task/TaskDetailsModal";
import { Badge } from "../../components/ui/Badge";

import { useBoard } from "../../hooks/useBoard";
import { useAuth } from "../../hooks/useAuth";
import { useBoardPermissions } from "../../hooks/useBoardPermissions";
import { useBoardOperations } from "../../hooks/useBoardOperations";
import { useTaskOperations } from "../../hooks/useTaskOperations";
import { useComments } from "../../hooks/useComments";

import { BoardsDocument, TasksDocument, GetUsersDocument } from "../../gql/graphql";
import { type Task, type TaskStatus } from "../../types/task";

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

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const COLUMNS = STATUS_ORDER.map((status) => ({
  id: status,
  title: status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
}));

export default function Board({ boardId }: { boardId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");
  const [viewMode, setViewMode] = useState<"BOARD" | "LIST">("BOARD");
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);

  // Board members modal states
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "VIEWER">("MEMBER");

  // Comments states
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Modal state — replaces browser prompt() / confirm()
  const [boardModal, setBoardModal] = useState<
    | { type: "create" }
    | { type: "rename"; currentName: string }
    | { type: "delete" }
    | { type: "archive" }
    | null
  >(null);
  const boardModalInputRef = useRef<HTMLInputElement>(null);
  const [boardModalInput, setBoardModalInput] = useState("");

  const { data: boardsData, loading: boardsLoading, error: boardsError } = useQuery(BoardsDocument);
  const { board, tasks, loading, error, refetch } = useBoard(boardId);
  const { data: usersData } = useQuery(GetUsersDocument);

  // Custom Hooks for operations and permissions
  const {
    canEditTasks,
    canManageBoard,
    isBoardOwner,
    userBoardRole,
  } = useBoardPermissions(board, user);

  const {
    createBoard,
    updateBoard,
    deleteBoard,
    archiveBoard,
    addBoardMember,
    removeBoardMember,
    updateBoardMemberRole,
  } = useBoardOperations(boardId);

  const {
    createTask,
    updateTask,
    deleteTask,
    archiveTask,
    assignTask,
    changeTaskStatus,
    creatingTask,
  } = useTaskOperations({
    boardId,
    onSuccess: () => {
      refetch();
      if (viewMode === "LIST") void refetchList();
    },
    onAssignSuccess: (assignee) => {
      if (activeTask) {
        setActiveTask({ ...activeTask, assignee });
      }
    },
  });

  const { addComment, updateComment, deleteComment } = useComments({
    onSuccess: async () => {
      const res = await refetch();
      const updatedTask = res.data?.board?.tasks.find((t) => t.id === activeTask?.id);
      if (updatedTask) {
        setActiveTask(updatedTask as any);
      }
    },
  });

  useEffect(() => {
    // Navigate to the first active (non-archived) board by default
    if (!boardId && boardsData?.boards && boardsData.boards.length > 0) {
      const activeBoards = boardsData.boards.filter((b) => !b.isArchived);
      if (activeBoards.length > 0) {
        navigate(`/board/${activeBoards[0].id}`, { replace: true });
      }
    }
  }, [boardId, boardsData, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, priorityFilter]);

  const { data: listData, loading: listLoading, error: listError, refetch: refetchList } = useQuery(TasksDocument, {
    variables: {
      page: currentPage,
      limit: limitPerPage,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
    },
    skip: viewMode !== "LIST",
  });

  const handleCreate = async (newTask: any) => {
    await createTask(newTask);
  };

  const handleUpdate = async (updatedData: any) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, updatedData);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    setActiveTask(null);
  };

  const handleArchive = async (taskId: string) => {
    if (confirm("Archive this task? It will be hidden from the active board.")) {
      await archiveTask(taskId);
      setActiveTask(null);
    }
  };

  const handleCreateBoard = () => {
    setBoardModalInput("");
    setBoardModal({ type: "create" });
    setTimeout(() => boardModalInputRef.current?.focus(), 50);
  };

  const handleRenameBoard = () => {
    if (!boardId || !board) return;
    setBoardModalInput(board.name);
    setBoardModal({ type: "rename", currentName: board.name });
    setTimeout(() => boardModalInputRef.current?.focus(), 50);
  };

  const handleDeleteBoard = () => {
    setBoardModal({ type: "delete" });
  };

  const handleBoardModalConfirm = async () => {
    if (!boardModal) return;

    if (boardModal.type === "create") {
      const name = boardModalInput.trim();
      if (!name) return;
      await createBoard(name);
    } else if (boardModal.type === "rename") {
      const name = boardModalInput.trim();
      if (!name || name === boardModal.currentName) {
        setBoardModal(null);
        return;
      }
      await updateBoard(boardId, name);
      refetch();
    } else if (boardModal.type === "archive") {
      await archiveBoard(boardId);
    } else if (boardModal.type === "delete") {
      await deleteBoard(boardId);
    }

    setBoardModal(null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    const currentTask = tasks.find((task) => task.id === activeTaskId);
    if (!currentTask) return;

    const overColumn = COLUMNS.find((column) => column.id === overId);
    if (overColumn) {
      await changeTaskStatus(currentTask, overColumn.id);
      return;
    }

    const targetTask = tasks.find((task) => task.id === overId);
    if (targetTask && targetTask.status !== currentTask.status) {
      await changeTaskStatus(currentTask, targetTask.status);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [filteredTasks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  if (!boardId) {
    if (boardsLoading) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <StatePanel
            icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
            title="Loading workspace"
            description="Fetching your boards..."
          />
        </div>
      );
    }

    if (boardsError) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <StatePanel
            icon={<AlertTriangle className="h-6 w-6 text-danger" />}
            title="Failed to load boards"
            description={boardsError.message}
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <StatePanel
          icon={<Inbox className="h-6 w-6 text-slate-400" />}
          title="No boards found"
          description={
            user?.role === "USER"
              ? "You do not have any boards assigned to you yet. Ask your manager to assign you to a board."
              : "Create your first board to start managing your projects and tasks."
          }
          actionLabel={user?.role === "USER" ? undefined : "Create first board"}
          onAction={user?.role === "USER" ? undefined : handleCreateBoard}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Board Selector, Member list, and Action buttons */}
      <BoardSelector
        boards={boardsData?.boards ?? []}
        boardId={boardId}
        onSelectBoard={(val) => {
          if (val === "CREATE_NEW") {
            handleCreateBoard();
          } else {
            navigate(`/board/${val}`);
          }
        }}
        onRenameBoard={handleRenameBoard}
        onArchiveBoard={() => setBoardModal({ type: "archive" })}
        onDeleteBoard={handleDeleteBoard}
        onManageMembers={() => setMembersModalOpen(true)}
        canManageBoard={canManageBoard}
        hasMembersAccess={!!(userBoardRole || user?.role === "ADMIN")}
        boardOwnerName={board?.owner?.name}
        canCreateBoard={user?.role === "ADMIN" || user?.role === "MANAGER"}
      />

      {/* Title description and creation action header */}
      {board && (
        <BoardHeader
          boardName={board.name}
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          setEditingTask={setEditingTask}
          setActiveTask={setActiveTask}
          canEditTasks={canEditTasks}
        />
      )}

      {/* Search filters layouts and results bar */}
      <TaskFilterBar
        search={search}
        setSearch={setSearch}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        resultsCount={viewMode === "BOARD" ? filteredTasks.length : listData?.tasks.total ?? 0}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {isCreating && (
        <div className="mb-8">
          <TaskForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
          {creatingTask ? <p className="mt-4 text-sm text-slate-600">Creating task…</p> : null}
        </div>
      )}

      {viewMode === "BOARD" ? (
        loading ? (
          <StatePanel
            icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
            title="Loading tasks"
            description="Fetching tasks from your boards. This should only take a moment."
          />
        ) : error ? (
          <StatePanel
            icon={<AlertTriangle className="h-6 w-6 text-danger" />}
            title="Failed to load tasks"
            description="There was an issue loading your tasks. Refresh or try again later."
            actionLabel="Retry"
            onAction={() => void refetch()}
            buttonVariant="secondary"
          />
        ) : filteredTasks.length === 0 ? (
          <StatePanel
            icon={<Inbox className="h-6 w-6 text-slate-400" />}
            title="No tasks found"
            description="Try a different search or filter to discover tasks in your board."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("");
              setPriorityFilter("ALL");
            }}
            buttonVariant="secondary"
          />
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid gap-6 lg:grid-cols-4">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tasks={tasksByColumn[column.id] ?? []}
                  statusOrder={STATUS_ORDER}
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
                      STATUS_ORDER[Math.max(0, STATUS_ORDER.indexOf(taskToMove.status) - 1)]
                    )
                  }
                  onMoveRight={(taskToMove) =>
                    changeTaskStatus(
                      taskToMove,
                      STATUS_ORDER[Math.min(STATUS_ORDER.length - 1, STATUS_ORDER.indexOf(taskToMove.status) + 1)]
                    )
                  }
                  disabled={!canEditTasks}
                  currentUserId={user?.role === "USER" ? user.id : undefined}
                  isBoardOwner={isBoardOwner}
                />
              ))}
            </div>
          </DndContext>
        )
      ) : listLoading ? (
        <StatePanel
          icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
          title="Loading task list"
          description="Querying server-side paginated tasks..."
        />
      ) : listError ? (
        <StatePanel
          icon={<AlertTriangle className="h-6 w-6 text-danger" />}
          title="Failed to load task list"
          description={listError.message}
          actionLabel="Retry"
          onAction={() => void refetchList()}
          buttonVariant="secondary"
        />
      ) : !listData?.tasks || listData.tasks.data.length === 0 ? (
        <StatePanel
          icon={<Inbox className="h-6 w-6 text-slate-400" />}
          title="No tasks found"
          description="Try a different search or filter to discover tasks in your workspace."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch("");
            setPriorityFilter("ALL");
          }}
          buttonVariant="secondary"
        />
      ) : (
        <div>
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Task
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Assignee
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {listData.tasks.data.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
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
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant={
                        task.priority === "HIGH"
                          ? "destructive"
                          : task.priority === "MEDIUM"
                          ? "warning"
                          : "success"
                      }>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      {formatDate(task.dueDate) || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      {task.assignee?.name || "Unassigned"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => setActiveTask(task as any)}
                        className="text-primary hover:text-primary-dark transition hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {listData.tasks.totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500 font-medium">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {(currentPage - 1) * limitPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * limitPerPage, listData.tasks.total)}
                </span>{" "}
                of <span className="font-semibold text-slate-900">{listData.tasks.total}</span>{" "}
                tasks
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl px-3 py-1.5 text-xs"
                >
                  Previous
                </Button>

                {Array.from({ length: listData.tasks.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`h-8 w-8 rounded-xl text-xs font-semibold transition ${
                      currentPage === p
                        ? "bg-primary text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <Button
                  variant="secondary"
                  disabled={currentPage >= listData.tasks.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(listData.tasks.totalPages, p + 1))}
                  className="rounded-xl px-3 py-1.5 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Details and Comments Overlay */}
      {activeTask && (
        <TaskDetailsModal
          activeTask={activeTask}
          setActiveTask={setActiveTask}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          canEditTasks={canEditTasks}
          canManageBoard={canManageBoard}
          userBoardRole={userBoardRole}
          userGlobalRole={user?.role}
          currentUserId={user?.id}
          boardMembers={board?.members ?? []}
          onAssignTask={assignTask}
          onChangeTaskStatus={changeTaskStatus}
          onUpdateTask={handleUpdate}
          onArchiveTask={handleArchive}
          onDeleteTask={handleDelete}
          
          commentInput={commentInput}
          setCommentInput={setCommentInput}
          onPostComment={async (e) => {
            e.preventDefault();
            if (!commentInput.trim()) return;
            await addComment(activeTask.id, commentInput);
            setCommentInput("");
          }}
          editingCommentId={editingCommentId}
          setEditingCommentId={setEditingCommentId}
          editingCommentText={editingCommentText}
          setEditingCommentText={setEditingCommentText}
          onSaveEditComment={async (commentId) => {
            if (!editingCommentText.trim()) return;
            await updateComment(commentId, editingCommentText);
            setEditingCommentId(null);
          }}
          onDeleteComment={async (commentId) => {
            if (confirm("Delete this comment?")) {
              await deleteComment(commentId);
            }
          }}
        />
      )}

      {/* Board Confirmation Modals */}
      <BoardActionModals
        boardModal={boardModal}
        setBoardModal={setBoardModal}
        boardName={board?.name}
        boardModalInputRef={boardModalInputRef}
        boardModalInput={boardModalInput}
        setBoardModalInput={setBoardModalInput}
        onConfirm={handleBoardModalConfirm}
      />

      {/* Board Members Overlay Modal */}
      {board && (
        <BoardMembersModal
          isOpen={membersModalOpen}
          onClose={() => setMembersModalOpen(false)}
          board={board}
          users={usersData?.users ?? []}
          inviteUserId={inviteUserId}
          setInviteUserId={setInviteUserId}
          inviteRole={inviteRole}
          setInviteRole={setInviteRole}
          onInvite={async () => {
            if (!inviteUserId) return;
            await addBoardMember(inviteUserId, inviteRole);
            setInviteUserId("");
          }}
          onUpdateRole={updateBoardMemberRole}
          onRemoveMember={removeBoardMember}
          canManageBoard={canManageBoard}
        />
      )}
    </div>
  );
}