import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatsGrid from "../../components/dashboard/StatsGrid";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentTasks from "../../components/dashboard/RecentTasks";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import StatePanel from "../../components/common/StatePanel";
import { AlertTriangle } from "lucide-react";

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
        <StatePanel
          icon={<AlertTriangle className="h-6 w-6 text-danger" />}
          title="Failed to load dashboard data"
          description={error.message}
        />
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
        users={dashboard.users}
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