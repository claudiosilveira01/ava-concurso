import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  color?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, className, color = "#3B82F6", disabled }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors disabled:opacity-50",
        checked ? "animate-check-pop" : "",
        className
      )}
      style={{
        borderColor: color,
        backgroundColor: checked ? color : "transparent",
      }}
    >
      {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
    </button>
  );
}
