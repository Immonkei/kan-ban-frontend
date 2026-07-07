export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="h-4 w-40 rounded bg-slate-200" />

        <div className="mt-4 h-8 w-72 rounded bg-slate-200" />

        <div className="mt-3 h-4 w-96 rounded bg-slate-200" />
      </div>


      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="h-4 w-24 rounded bg-slate-200" />

            <div className="mt-4 h-10 w-16 rounded bg-slate-200" />
          </div>
        ))}

      </div>


      {/* Content */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="h-5 w-40 rounded bg-slate-200" />

        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 rounded bg-slate-200"
            />
          ))}
        </div>
      </div>

    </div>
  );
}