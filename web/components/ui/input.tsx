import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, id, "aria-describedby": describedBy, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border border-border bg-background/50 px-3.5 py-2 text-sm text-foreground placeholder:text-[#71796c] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-400/60 focus:ring-red-400/30 focus:border-red-400",
            className
          )}
          ref={ref}
          {...props}
          id={inputId}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={[describedBy, error ? errorId : null].filter(Boolean).join(" ") || undefined}
        />
        {error && (
          <span id={errorId} className="mt-1.5 block text-xs text-red-300">
            {error}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
