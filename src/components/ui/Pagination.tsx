import { Button } from "./button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limitPerPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    limitPerPage,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500 font-medium">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                    {(currentPage - 1) * limitPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                    {Math.min(currentPage * limitPerPage, totalItems)}
                </span>{" "}
                of <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
                tasks
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="rounded-xl px-3 py-1.5 text-xs h-8"
                >
                    Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`h-8 w-8 rounded-xl text-xs font-semibold transition ${currentPage === p
                                ? "bg-primary text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {p}
                    </button>
                ))}

                <Button
                    variant="secondary"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="rounded-xl px-3 py-1.5 text-xs h-8"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
