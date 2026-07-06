import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signUp(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:flex-row">
        <div className="hidden flex-1 bg-gradient-to-b from-secondary/30 via-secondary/20 to-primary/10 p-10 text-white sm:flex sm:flex-col sm:justify-center">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-100">Create your account</p>
            <h1 className="mt-5 text-3xl font-semibold">Start managing tasks</h1>
            <p className="mt-4 max-w-xl text-sm text-slate-100/90">
              Create your account to access boards, assign tasks, and collaborate with your team.
            </p>
          </div>
        </div>

        <div className="w-full p-8 sm:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Register</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-600">Sign up and start organizing your workflow today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {error ? (
              <p className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            ) : null}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-3xl shadow-sm shadow-primary/20"
            >
              {submitting ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
