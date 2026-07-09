import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Button from "../../components/common/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setError(null);

    try {
      await signIn(data.email, data.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:flex-row">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
              ) : null}
            </div>

            {error ? (
              <p className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center rounded-2xl bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
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