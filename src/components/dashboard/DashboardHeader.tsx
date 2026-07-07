import { CalendarDays } from "lucide-react";

interface DashboardHeaderProps {
  name: string;
}

export default function DashboardHeader({
  name,
}: DashboardHeaderProps) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <CalendarDays className="h-4 w-4" />
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      <h1 className="text-3xl font-bold text-slate-900">
        {greeting}, {name} 👋
      </h1>

      <p className="text-slate-500">
        Welcome back. Here's what's happening today.
      </p>
    </div>
  );
}