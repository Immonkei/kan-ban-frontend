import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:flex-row">
        {/* was bg-linear-to-b (not a real Tailwind class) + rounded-4xl (not in default scale) */}
        <div className="hidden flex-1 bg-linear-to-br from-primary via-primary/80 to-secondary p-10 text-white sm:flex sm:flex-col sm:justify-center">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-secondary">Welcome back</p>
            <h1 className="mt-5 text-3xl font-semibold text-white">Sign in to your workspace</h1>
            <p className="mt-4 max-w-xl text-sm text-white/90">
              Access your kanban boards, create tasks faster, and keep every project aligned in one place.
            </p>
          </div>
        </div>

        <div className="w-full p-8 sm:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Sign in</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600">Enter your details to continue to your task dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {error ? (
              <p className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            ) : null}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full justify-center rounded-2xl bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-secondary">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}