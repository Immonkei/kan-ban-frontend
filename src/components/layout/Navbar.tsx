import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Columns, LogIn, LogOut, Menu , User, X , Users , LayoutDashboard } from "lucide-react";
import clsx from "clsx";
import Button from "../common/Button";
import { useAuth } from "../../hooks/useAuth";
import logoUrl from "../../assets/kanban-logo.svg";

type Role = "USER" | "MANAGER" | "ADMIN";

type NavLink = {
  to: string;
  label: string;
  icon: typeof Columns;
  roles?: Role[];
};

const NAV_LINKS: NavLink[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/board",
    label: "Board",
    icon: Columns,
  },
  {
    to: "/team",
    label: "Team",
    icon: Users,
    roles: ["MANAGER", "ADMIN"],
  },
  {
    to: "/users",
    label: "Users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    to: "/me",
    label: "Profile",
    icon: User,
  },
];

// const NAV_LINKS: NavLink[] = [
//   { to: "/dashboard", label: "Dashboard", icon: Shield, roles: ["ADMIN"], badge: "Admin" },
//   { to: "/board", label: "Board", icon: Columns },
//   { to: "/manager", label: "Dashboard", icon: Shield, roles: ["MANAGER"], badge: "Manager" },
//   { to: "/me", label: "Profile", icon: User },
// ];

function visibleLinks(role?: Role) {
  if (!role) return [];

  return NAV_LINKS.filter(
    (link) => !link.roles || link.roles.includes(role)
  );
}


function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function NavItem({
  link,
  active,
  onClick,
}: {
  link: NavLink;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = link.icon;

  return (
    <Link
      to={link.to}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-primary/10 text-primary"
          : "text-slate-700 hover:bg-slate-100 hover:text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {link.label}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = visibleLinks(user?.role as Role | undefined);

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

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavItem key={link.to} link={link} active={location.pathname === link.to} />
          ))}
        </div>

        <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 md:flex">
          {user ? (
            <>
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {initials(user.name)}
                </span>
                {user.name}
              </span>
              <Button
                variant="secondary"
                type="button"
                onClick={logout}
                className="hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
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
            {links.map((link) => (
              <NavItem
                key={link.to}
                link={link}
                active={location.pathname === link.to}
                onClick={() => setMenuOpen(false)}
              />
            ))}

            <div className="border-t border-slate-200 pt-4">
              {user ? (
                <>
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {initials(user.name)}
                    </span>
                    {user.name}
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="hover:border-danger/30 hover:bg-danger/5 hover:text-danger">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-primary/90"
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