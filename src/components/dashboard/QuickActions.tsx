import { useNavigate } from "react-router-dom";
import {
  Plus,
  LayoutDashboard,
  ListTodo,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  roles?: ("USER" | "MANAGER" | "ADMIN")[];
}

export default function QuickActions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      label: "Create Board",
      description: "Start a new project board",
      icon: Plus,
      onClick: () => navigate("/board"),
      roles: ["ADMIN", "MANAGER"],
    },
    {
      label: "Create Task",
      description: "Add a new task quickly",
      icon: LayoutDashboard,
      onClick: () => navigate("/board"),
      roles: ["ADMIN", "MANAGER"],
    },
    {
      label: "My Tasks",
      description: "View your assigned tasks",
      icon: ListTodo,
      onClick: () => navigate("/tasks"),
      roles: ["ADMIN", "MANAGER", "USER"],
    },
    {
      label: "Edit Profile",
      description: "Manage your profile settings",
      icon: User,
      onClick: () => navigate("/me"),
      roles: ["ADMIN", "MANAGER", "USER"],
    },
  ];

  const visibleActions = actions.filter(
    (action) => !action.roles || action.roles.includes(user?.role as any)
  );

  if (visibleActions.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Quick Actions
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-primary hover:shadow-sm cursor-pointer w-full bg-white"
              onClick={action.onClick}
            >
              <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">
                  {action.label}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}