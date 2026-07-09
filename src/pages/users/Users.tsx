import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Search, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import StatePanel from "../../components/common/StatePanel";
import PageHeader from "../../components/ui/PageHeader";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table";
import { Input } from "../../components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import {
  GetUsersDocument,
  UpdateUserDocument,
  DeleteUserDocument,
} from "../../gql/graphql";

// Form validation schema
const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface TargetUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<TargetUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GetUsersDocument);

  const [updateUser, { loading: updating }] = useMutation(UpdateUserDocument, {
    onCompleted: () => {
      setEditingUser(null);
      void refetch();
    },
  });

  const [deleteUser] = useMutation(DeleteUserDocument, {
    onCompleted: () => {
      void refetch();
    },
  });

  // React hook form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  // Prefill form when opening edit modal
  const handleStartEdit = (user: TargetUser) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
    });
  };

  const handleSave = async (formData: EditUserFormData) => {
    if (!editingUser) return;
    await updateUser({
      variables: {
        id: editingUser.id,
        input: formData,
      },
    });
  };

  const handleDeleteClick = (id: string) => {
    if (Number(id) === Number(currentUser?.id)) {
      alert("You cannot delete your own admin account.");
      return;
    }
    setUserToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    await deleteUser({
      variables: { id: userToDelete },
    });
    setUserToDelete(null);
  };

  // Client-side search filtering
  const filteredUsers = useMemo(() => {
    const list = data?.users ?? [];
    if (!search.trim()) return list;

    const term = search.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [data, search]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
          title="Loading accounts"
          description="Fetching registered system users..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<AlertTriangle className="h-6 w-6 text-danger" />}
          title="Failed to load accounts"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <PageHeader
        label="Security Control"
        title="User Management"
        description="Control member details, view authorization states, and manage system access."
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 max-w-md relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 text-slate-400 z-10" />
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white rounded-2xl"
        />
      </div>

      {/* Main Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-slate-400">
                No users matching filter criteria.
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                </TableCell>
                <TableCell>
                  {member.email}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border ${member.role === "ADMIN"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : member.role === "MANAGER"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                  >
                    {member.role}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(member)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                      aria-label="Edit User"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(member.id)}
                      disabled={Number(member.id) === Number(currentUser?.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-danger transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                      aria-label="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleSave)} className="mt-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Name</label>
              <Input
                type="text"
                {...register("name")}
                className="mt-2"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
              <Input
                type="email"
                {...register("email")}
                className="mt-2"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={updating} className="w-full">
                {updating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setEditingUser(null)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete user"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete User"
        variant="danger"
      />
    </div>
  );
}

