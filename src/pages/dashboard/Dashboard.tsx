import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatsGrid from "../../components/dashboard/StatsGrid";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentTasks from "../../components/dashboard/RecentTasks";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";



import { useAuth } from "../../hooks/useAuth";
import { useDashboard } from "../../hooks/useDashboard";


export default function Dashboard() {

  const { user } = useAuth();

  const {
    dashboard,
    loading,
    error,
  } = useDashboard();


  if (loading) {
    return <DashboardSkeleton />;
  }


if (error) {
  return (
    <div className="p-6">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        <h3 className="font-semibold">
          Failed to load dashboard data
        </h3>

        <p className="mt-2 text-sm">
          {error.message}
        </p>
      </div>
    </div>
  );
}


  if (!dashboard) {
    return null;
  }


  return (
    <main className="space-y-6 p-6">

      {/* Welcome */}
      <DashboardHeader
        name={user?.name ?? "User"}
      />


      {/* Statistics */}
      <StatsGrid
        boards={dashboard.boards}
        tasks={dashboard.tasks}
        progress={dashboard.progress}
        completed={dashboard.completed}
      />


      {/* Quick Actions */}
      <QuickActions />


      {/* Recent Tasks */}
      <RecentTasks
        tasks={dashboard.recentTasks}
      />

    </main>
  );
}