import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Button as ShadcnButton } from "../ui/button";
import { cn } from "../ui/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
}

export default function Button({
  variant = "primary",
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  const shadcnVariant =
    variant === "primary"
      ? "default"
      : variant === "secondary"
        ? "outline"
        : "ghost";

  return (
    <ShadcnButton
      variant={shadcnVariant}
      className={cn(
        "h-auto inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </ShadcnButton>
  );
}

