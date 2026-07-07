import {
  Plus,
  LayoutDashboard,
  Users,
} from "lucide-react";


interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
}


const actions: QuickAction[] = [
  {
    label: "Create Board",
    description: "Start a new project board",
    icon: Plus,
  },
  {
    label: "Create Task",
    description: "Add a new task quickly",
    icon: LayoutDashboard,
  },
  {
    label: "View Team",
    description: "Manage your workspace",
    icon: Users,
  },
];


export default function QuickActions() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-lg font-semibold text-slate-900">
        Quick Actions
      </h2>


      <div className="mt-4 grid gap-4 md:grid-cols-3">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-primary hover:shadow-sm"
              onClick={action.onClick}
            >

              <div className="rounded-xl bg-primary/10 p-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>


              <div>
                <p className="font-medium text-slate-900">
                  {action.label}
                </p>

                <p className="text-sm text-slate-500">
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