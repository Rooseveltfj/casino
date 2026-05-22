import * as React from "react";
import { cn } from "../../lib/utils";

type OrbColor = "cyan" | "gold" | "success" | "error";

interface GlowOrbProps extends React.ComponentProps<"div"> {
  size?: number;
  color?: OrbColor;
  intensity?: "subtle" | "normal" | "strong";
  pulse?: boolean;
}

const colorMap: Record<OrbColor, { bg: string; glow: string }> = {
  cyan: {
    bg: "radial-gradient(circle at 35% 35%, #00f0ff, #00a8cc 50%, #003d5c)",
    glow: "0 0 60px rgba(0, 212, 255, 0.5), 0 0 120px rgba(0, 212, 255, 0.2)",
  },
  gold: {
    bg: "radial-gradient(circle at 35% 35%, #ffd700, #ffb800 50%, #7a5600)",
    glow: "0 0 60px rgba(255, 184, 0, 0.5), 0 0 120px rgba(255, 184, 0, 0.2)",
  },
  success: {
    bg: "radial-gradient(circle at 35% 35%, #00ffb3, #00f5a0 50%, #003d28)",
    glow: "0 0 60px rgba(0, 245, 160, 0.5), 0 0 120px rgba(0, 245, 160, 0.2)",
  },
  error: {
    bg: "radial-gradient(circle at 35% 35%, #ff6b8a, #ff3d71 50%, #5c0020)",
    glow: "0 0 60px rgba(255, 61, 113, 0.5), 0 0 120px rgba(255, 61, 113, 0.2)",
  },
};

const intensityMap: Record<
  NonNullable<GlowOrbProps["intensity"]>,
  { opacity: number; scale: number }
> = {
  subtle: { opacity: 0.5, scale: 0.85 },
  normal: { opacity: 0.75, scale: 1 },
  strong: { opacity: 1, scale: 1.15 },
};

function GlowOrb({
  size = 120,
  color = "cyan",
  intensity = "normal",
  pulse = true,
  className,
  style,
  ...props
}: GlowOrbProps) {
  const { bg, glow } = colorMap[color];
  const { opacity, scale } = intensityMap[intensity];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none shrink-0 rounded-full select-none",
        pulse && "animate-glow-pulse",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: glow,
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
      {...props}
    />
  );
}

export { GlowOrb };
export type { GlowOrbProps, OrbColor };
