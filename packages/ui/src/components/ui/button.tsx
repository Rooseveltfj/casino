"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded",
    "text-sm font-medium transition-all duration-200 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-accent-primary text-background font-semibold",
          "hover:brightness-110 hover:shadow-glow-primary",
          "focus-visible:shadow-glow-primary",
        ],
        destructive: [
          "bg-error text-text-primary font-semibold",
          "hover:brightness-110 hover:shadow-glow-error",
        ],
        outline: [
          "border border-border-default bg-transparent text-text-primary",
          "hover:bg-surface-elevated hover:border-accent-primary",
          "focus-visible:border-accent-primary",
        ],
        secondary: [
          "bg-surface-elevated text-text-primary",
          "hover:bg-surface hover:shadow-[0_0_12px_rgba(0,212,255,0.1)]",
        ],
        ghost: [
          "bg-transparent text-text-secondary",
          "hover:bg-surface hover:text-text-primary",
        ],
        link: "bg-transparent text-accent-primary underline-offset-4 hover:underline p-0 h-auto",
        gold: [
          "bg-accent-secondary text-background font-semibold",
          "hover:brightness-110 hover:shadow-glow-gold",
          "focus-visible:shadow-glow-gold focus-visible:ring-accent-secondary",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
