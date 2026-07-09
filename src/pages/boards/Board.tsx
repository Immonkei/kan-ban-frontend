import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type DragEndEvent } from "@dnd-kit/core";
import { useQuery } from "@apollo/client/react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

import StatePanel from "../../components/common/StatePanel";
import TaskForm from "../../components/task/TaskForm";

import BoardHeader from "../../components/board/BoardHeader";
import BoardSelector from "../../components/board/BoardSelector";
import BoardMembersModal from "../../components/board/BoardMembersModal";
import BoardActionModals from "../../components/board/BoardActionModals";
import TaskFilterBar from "../../components/task/TaskFilterBar";
import TaskDetailsModal from "../../components/task/TaskDetailsModal";
import BoardKanbanView from "../../components/board/BoardKanbanView";
import BoardListView from "../../components/board/BoardListView";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";

import { useBoard } from "../../hooks/useBoard";
import { useAuth } from "../../hooks/useAuth";
import { useBoardPermissions } from "../../hooks/useBoardPermissions";
import { useBoardOperations } from "../../hooks/useBoardOperations";
import { useTaskOperations } from "../../hooks/useTaskOperations";
import { useComments } from "../../hooks/useComments";

import { BoardsDocument, TasksDocument, GetUsersDocument } from "../../gql/graphql";
import { type Task, type TaskStatus } from "../../types/task";

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

  // Archive and Delete confirmation states
  const [taskToArchive, setTaskToArchive] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

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
  const { board, loading, error, refetch } = useBoard(boardId);
  const { data: usersData } = useQuery(GetUsersDocument);

  // Paginated task queries for List View
  const {
    data: listData,
    loading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery(TasksDocument, {
    variables: {
      page: currentPage,
      limit: limitPerPage,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
    },
    skip: !boardId,
  });

  // Kanban task queries (fully backend-filtered and backend-searched)
  const {
    data: kanbanTasksData,
    loading: kanbanTasksLoading,
    error: kanbanTasksError,
    refetch: refetchKanbanTasks,
  } = useQuery(TasksDocument, {
    variables: {
      page: 1,
      limit: 1000,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
    },
    skip: !boardId,
  });

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
    updateBoardMemberRole,
    removeBoardMember,
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
      void refetch();
      void refetchList();
      void refetchKanbanTasks();
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
      const updatedTask = res.data?.board?.tasks?.find((t) => t.id === activeTask?.id);
      if (updatedTask) {
        setActiveTask(updatedTask as unknown as Task);
      }
      void refetchList();
      void refetchKanbanTasks();
    },
  });

  useEffect(() => {
    if (!boardId && boardsData?.boards && boardsData.boards.length > 0) {
      const activeBoards = boardsData.boards.filter((b) => !b.isArchived);
      if (activeBoards.length > 0) {
        navigate(`/board/${activeBoards[0].id}`, { replace: true });
      }
    }
  }, [boardId, boardsData, navigate]);


  const handleCreate = async (
    newTask: Omit<Task, "id" | "createdAt" | "assignee" | "isArchived" | "creator" | "comments">
  ) => {
    await createTask(newTask);
  };

  const handleUpdate = async (
    updatedData: Omit<Task, "id" | "createdAt" | "assignee" | "isArchived" | "creator" | "comments">
  ) => {
    if (!activeTask) return;
    await updateTask(activeTask.id, updatedData);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    setActiveTask(null);
  };

  const handleArchiveClick = (taskId: string) => {
    setTaskToArchive(taskId);
  };

  const handleConfirmArchive = async () => {
    if (!taskToArchive) return;
    await archiveTask(taskToArchive);
    setActiveTask(null);
    setTaskToArchive(null);
  };

  const handleDeleteCommentClick = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    await deleteComment(commentToDelete);
    setCommentToDelete(null);
  };

  const handleCreateBoard = () => {
    setBoardModalInput("");
    setBoardModal({ type: "create" });
  };

  const handleRenameBoard = () => {
    if (!board) return;
    setBoardModalInput(board.name);
    setBoardModal({ type: "rename", currentName: board.name });
  };

  const handleDeleteBoard = () => {
    setBoardModal({ type: "delete" });
  };

  const handleBoardModalConfirm = async () => {
    if (!boardModal) return;
    if (boardModal.type === "create") {
      if (!boardModalInput.trim()) return;
      await createBoard(boardModalInput);
    } else if (boardModal.type === "rename") {
      if (!boardModalInput.trim() || boardModalInput === boardModal.currentName) return;
      await updateBoard(boardId, boardModalInput);
    } else if (boardModal.type === "delete") {
      await deleteBoard(boardId);
      navigate("/dashboard");
    } else if (boardModal.type === "archive") {
      await archiveBoard(boardId);
      navigate("/dashboard");
    }
    setBoardModal(null);
    setBoardModalInput("");
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || !canEditTasks) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentTask = filteredTasks.find((task) => task.id === activeId);
    if (!currentTask) return;

    const overColumn = COLUMNS.find((column) => column.id === overId);
    if (overColumn) {
      await changeTaskStatus(currentTask, overColumn.id);
      return;
    }

    const targetTask = filteredTasks.find((task) => task.id === overId);
    if (targetTask && targetTask.status !== currentTask.status) {
      await changeTaskStatus(currentTask, targetTask.status);
    }
  };

  const filteredTasks = useMemo(() => {
    return (kanbanTasksData?.tasks?.data ?? []) as unknown as Task[];
  }, [kanbanTasksData]);

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [filteredTasks]);

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
        <BoardKanbanView
          loading={loading || kanbanTasksLoading}
          error={error || kanbanTasksError}
          filteredTasks={filteredTasks}
          tasksByColumn={tasksByColumn}
          columns={COLUMNS}
          statusOrder={STATUS_ORDER}
          canEditTasks={canEditTasks}
          isBoardOwner={isBoardOwner}
          currentUserId={user?.role === "USER" ? user.id : undefined}
          setActiveTask={setActiveTask}
          setEditingTask={setEditingTask}
          handleDragEnd={handleDragEnd}
          changeTaskStatus={changeTaskStatus}
          refetch={refetch}
          clearFilters={() => {
            setSearch("");
            setPriorityFilter("ALL");
          }}
        />
      ) : (
        <BoardListView
          loading={listLoading}
          error={listError}
          listData={listData}
          currentPage={currentPage}
          limitPerPage={limitPerPage}
          onPageChange={setCurrentPage}
          setActiveTask={setActiveTask}
          refetchList={refetchList}
          clearFilters={() => {
            setSearch("");
            setPriorityFilter("ALL");
          }}
        />
      )}

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
          onArchiveTask={handleArchiveClick}
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
          onDeleteComment={handleDeleteCommentClick}
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

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={!!taskToArchive}
        onClose={() => setTaskToArchive(null)}
        onConfirm={handleConfirmArchive}
        title="Archive task"
        description="Are you sure you want to archive this task? It will be hidden from the active board."
        confirmLabel="Archive"
        variant="warning"
      />

      <ConfirmationDialog
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleConfirmDeleteComment}
        title="Delete comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
