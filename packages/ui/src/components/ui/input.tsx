"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-10 w-full rounded border border-border-default bg-input px-3 py-2",
          "text-sm text-text-primary placeholder:text-text-muted",
          "transition-all duration-200",
          "focus:outline-none focus:border-accent-primary focus:shadow-glow-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary",
          "aria-invalid:border-error aria-invalid:focus:shadow-glow-error",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
