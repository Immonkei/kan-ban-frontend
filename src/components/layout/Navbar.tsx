import { useState } from "react";
import { Link } from "react-router-dom";
import { Columns, LogIn, LogOut, Menu, Shield, User, X } from "lucide-react";
import Button from "../common/Button";
import { useAuth } from "../../hooks/useAuth";
import logoUrl from "../../assets/kanban-logo.svg";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm transition hover:border-slate-300"
          >
            <img src={logoUrl} alt="Kanban logo" className="h-10 w-10" />
            <div>
              <div className="text-base font-semibold text-slate-900">Kanban Task Manager</div>
              <div className="text-sm text-slate-500">Organize your workflow</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/board" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
            <Columns className="h-4 w-4" />
            Kanban
          </Link>
          <Link to="/me" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
            <User className="h-4 w-4" />
            Profile
          </Link>
          {user?.role === "MANAGER" ? (
            <Link to="/manager" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
              <Shield className="h-4 w-4" />
              Manager Home
            </Link>
          ) : null}
          {user?.role === "ADMIN" ? (
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
              <Shield className="h-4 w-4" />
              Dashboard
            </Link>
          ) : null}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="inline-flex items-center gap-2 text-sm text-slate-700">
            <User className="h-4 w-4 text-slate-500" />
            {user?.name ?? "Guest"}
          </span>
          {user ? (
            <Button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>

      {menuOpen ? (
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              to="/board"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              <Columns className="h-4 w-4" />
              Kanban
            </Link>
            <Link
              to="/me"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            {user?.role === "ADMIN" ? (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : null}
            {user?.role === "MANAGER" ? (
              <Link
                to="/manager"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Manager Home
              </Link>
            ) : null}
            <div className="border-t border-slate-200 pt-4">
              <div className="mb-2 text-sm text-slate-700">{user?.name ?? "Guest"}</div>
              {user ? (
                <Button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
