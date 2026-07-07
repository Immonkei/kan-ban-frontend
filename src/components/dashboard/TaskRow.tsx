import {
  Clock3,
  CheckCircle2,
} from "lucide-react";


interface TaskRowProps {
  title: string;
  board: string;
  status: string;
  priority: string;
}


export default function TaskRow({
  title,
  board,
  status,
  priority,
}: TaskRowProps) {

  const completed = status === "DONE";


  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Clock3 className="h-5 w-5 text-slate-400" />
        )}


        <div>
          <p className="font-medium text-slate-900">
            {title}
          </p>

          <p className="text-sm text-slate-500">
            {board}
          </p>
        </div>

      </div>


      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        {priority}
      </span>

    </div>
  );
}