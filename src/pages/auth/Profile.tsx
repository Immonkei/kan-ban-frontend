import { useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  const userRole = useMemo(() => {
    if (!user) return "Guest";
    return user.role === "ADMIN" ? "Administrator" : user.role === "MANAGER" ? "Manager" : "User";
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Profile</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Your account</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Review your account details and keep your profile up to date.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            {userRole}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Personal info</h2>
            <p className="mt-2 text-sm text-slate-600">Basic account information used for authentication.</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</p>
                <p className="mt-2 text-base font-medium text-slate-900">{user?.name ?? "Anonymous"}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                <p className="mt-2 text-base font-medium text-slate-900">{user?.email ?? "Not available"}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Role</p>
                <p className="mt-2 text-base font-medium text-slate-900">{userRole}</p>
              </div>
            </div>
          </section>

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
