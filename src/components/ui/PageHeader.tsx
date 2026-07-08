import { ReactNode } from "react";
import { cn } from "./utils";

interface PageHeaderProps {
    label?: string;
    title: ReactNode;
    description?: string;
    children?: ReactNode;
    className?: string;
    titleClassName?: string;
}

export default function PageHeader({
    label,
    title,
    description,
    children,
    className,
    titleClassName,
}: PageHeaderProps) {
    return (
        <div className={cn("mb-6 flex flex-wrap items-center justify-between gap-4", className)}>
            <div>
                {label && (
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                        {label}
                    </p>
                )}
                <h1 className={cn("mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl", titleClassName)}>
                    {title}
                </h1>
                {description && (
                    <p className="mt-2 text-sm text-slate-600">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
