import { ClipboardList } from "lucide-react";


interface EmptyStateProps {
  title: string;
  description: string;
}


export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

      <div className="rounded-full bg-primary/10 p-4">
        <ClipboardList className="h-8 w-8 text-primary" />
      </div>


      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {title}
      </h3>


      <p className="mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}