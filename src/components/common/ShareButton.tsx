import { type ButtonHTMLAttributes } from "react";
import { Share2 } from "lucide-react";
import Button from "./Button";

interface ShareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export default function ShareButton({ label = "Share", className = "", ...props }: ShareButtonProps) {
  return (
    <Button variant="secondary" className={className} {...props}>
      <Share2 className="h-4 w-4" />
      {label}
    </Button>
  );
}
