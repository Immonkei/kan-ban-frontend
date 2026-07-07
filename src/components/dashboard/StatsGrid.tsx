import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  FolderKanban,
} from "lucide-react";

import StatCard from "./StatCard";

interface Props {
  boards: number;
  tasks: number;
  progress: number;
  completed: number;
}

export default function StatsGrid({
  boards,
  tasks,
  progress,
  completed,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Boards"
        value={boards}
        icon={FolderKanban}
      />

      <StatCard
        title="Tasks"
        value={tasks}
        icon={ClipboardList}
      />

      <StatCard
        title="In Progress"
        value={progress}
        icon={Clock3}
      />

      <StatCard
        title="Completed"
        value={completed}
        icon={CheckCircle2}
      />
    </div>
  );
}