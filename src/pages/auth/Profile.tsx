import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { Pencil, X, Check } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import { UpdateUserDocument } from "../../gql/graphql";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const userRole = useMemo(() => {
    if (!user) return "Guest";
    return user.role === "ADMIN"
      ? "Administrator"
      : user.role === "MANAGER"
      ? "Manager"
      : "User";
  }, [user]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const [updateUser] = useMutation(UpdateUserDocument);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setServerError(null);
    try {
      await updateUser({
        variables: { id: user.id, input: data },
      });
      setIsEditing(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleCancel = () => {
    reset({ name: user?.name ?? "", email: user?.email ?? "" });
    setServerError(null);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Profile</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Your account
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Review your account details and keep your profile up to date.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            {userRole}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Info */}
          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Personal info</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Basic account information used for authentication.
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit profile"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-primary/30 hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 space-y-4"
              >
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    {...register("name")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    {...register("email")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {serverError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                    {serverError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex-1 justify-center rounded-2xl text-xs"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    {isSubmitting ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    className="flex-1 justify-center rounded-2xl text-xs"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</p>
                  <p className="mt-2 text-base font-medium text-slate-900">
                    {user?.name ?? "Anonymous"}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                  <p className="mt-2 text-base font-medium text-slate-900">
                    {user?.email ?? "Not available"}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Role</p>
                  <p className="mt-2 text-base font-medium text-slate-900">{userRole}</p>
                </div>
              </div>
            )}
          </section>

          {/* Security */}
          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            <p className="mt-2 text-sm text-slate-600">Manage your session and account details.</p>

            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Session status</p>
                <p className="mt-2 text-base font-medium text-slate-900">Active</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Account ID</p>
                <p className="mt-2 text-base font-medium text-slate-900">{user?.id ?? "n/a"}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
