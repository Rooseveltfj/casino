import * as React from "react";
import { cn } from "../../lib/utils";

type SpinnerSize = "sm" | "md" | "lg" | "xl";
type SpinnerColor = "primary" | "gold" | "white";

interface SpinnerProps extends React.ComponentProps<"span"> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
}

const sizeMap: Record<SpinnerSize, { dim: string; border: string }> = {
  sm: { dim: "size-4", border: "border-2" },
  md: { dim: "size-6", border: "border-2" },
  lg: { dim: "size-8", border: "border-[3px]" },
  xl: { dim: "size-12", border: "border-4" },
};

const colorMap: Record<
  SpinnerColor,
  { track: string; arc: string; shadow: string }
> = {
  primary: {
    track: "border-accent-primary/20",
    arc: "border-t-accent-primary",
    shadow: "[filter:drop-shadow(0_0_6px_rgba(0,212,255,0.7))]",
  },
  gold: {
    track: "border-accent-secondary/20",
    arc: "border-t-accent-secondary",
    shadow: "[filter:drop-shadow(0_0_6px_rgba(255,184,0,0.7))]",
  },
  white: {
    track: "border-white/20",
    arc: "border-t-white",
    shadow: "[filter:drop-shadow(0_0_4px_rgba(255,255,255,0.5))]",
  },
};

function Spinner({
  size = "md",
  color = "primary",
  label = "Carregando…",
  className,
  ...props
}: SpinnerProps) {
  const { dim, border } = sizeMap[size];
  const { track, arc, shadow } = colorMap[color];

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <span
        className={cn(
          "animate-spin rounded-full",
          dim,
          border,
          track,
          arc,
          shadow,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
export type { SpinnerProps, SpinnerSize, SpinnerColor };
