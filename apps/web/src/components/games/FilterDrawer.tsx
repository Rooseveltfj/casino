"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GameFilters } from "./GameFilters";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function FilterDrawer({
  open,
  onClose,
  searchQuery,
  onSearchChange,
}: FilterDrawerProps) {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Filtros de jogos"
            className="fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border-subtle overflow-y-auto"
            initial={prefersReduced ? {} : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={prefersReduced ? {} : { x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 bg-surface border-b border-border-subtle">
              <p className="text-sm font-semibold text-text-primary">Filtros</p>
              <button
                onClick={onClose}
                aria-label="Fechar filtros"
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="px-4">
              <GameFilters
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onClose={onClose}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
