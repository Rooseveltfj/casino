import * as React from "react";
import { cn } from "../../lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
  text?: string;
}

function Logo({
  size = 40,
  showText = false,
  text = "Casino",
  className,
  ...props
}: LogoProps) {
  const id = React.useId();
  const gradientCyanId = `logo-cyan-${id}`;
  const gradientGoldId = `logo-gold-${id}`;
  const glowId = `logo-glow-${id}`;

  return (
    <div className="inline-flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Casino Platform logo"
        role="img"
        className={cn("shrink-0", className)}
        {...props}
      >
        <defs>
          <radialGradient
            id={gradientCyanId}
            cx="50%"
            cy="50%"
            r="50%"
            fx="35%"
            fy="35%"
          >
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="1" />
            <stop offset="60%" stopColor="#0088CC" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#003366" stopOpacity="0.4" />
          </radialGradient>

          <radialGradient
            id={gradientGoldId}
            cx="60%"
            cy="40%"
            r="50%"
          >
            <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFB800" stopOpacity="0.6" />
          </radialGradient>

          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring — gold accent */}
        <circle
          cx="20"
          cy="20"
          r="19"
          stroke={`url(#${gradientGoldId})`}
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />

        {/* Mid ring */}
        <circle
          cx="20"
          cy="20"
          r="14"
          stroke={`url(#${gradientCyanId})`}
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />

        {/* Inner filled sphere */}
        <circle
          cx="20"
          cy="20"
          r="9"
          fill={`url(#${gradientCyanId})`}
          filter={`url(#${glowId})`}
        />

        {/* Gold accent dot */}
        <circle
          cx="20"
          cy="20"
          r="3"
          fill={`url(#${gradientGoldId})`}
          opacity="0.9"
        />

        {/* Shine highlight */}
        <ellipse
          cx="17"
          cy="16"
          rx="3"
          ry="2"
          fill="white"
          opacity="0.25"
          transform="rotate(-20 17 16)"
        />
      </svg>

      {showText && (
        <span className="font-heading font-bold text-xl tracking-tight text-text-primary">
          {text}
        </span>
      )}
    </div>
  );
}

export { Logo };
