"use client";

import { useEffect, useState } from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

/**
 * Sonner toaster pre-configured for the casino theme.
 *
 * Position is breakpoint-aware: bottom-right on >=640px, top-center on mobile.
 */
export function NotificationToaster() {
  const [position, setPosition] =
    useState<ToasterProps["position"]>("bottom-right");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 640px)");
    const sync = () =>
      setPosition(mql.matches ? "bottom-right" : "top-center");
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return (
    <SonnerToaster
      theme="dark"
      richColors
      closeButton
      position={position}
      offset={16}
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast:
            "!bg-surface !border-border-default !text-text-primary !font-sans !shadow-2xl",
          title: "!font-heading !font-semibold !text-text-primary",
          description: "!text-text-secondary",
          actionButton:
            "!bg-accent-primary !text-background !font-semibold !rounded",
          cancelButton: "!bg-surface-elevated !text-text-secondary",
          closeButton: "!bg-surface-elevated !border-border-default",
          success: "!border-success/40",
          error: "!border-error/40",
          warning: "!border-warning/40",
          info: "!border-accent-primary/40",
        },
      }}
    />
  );
}
