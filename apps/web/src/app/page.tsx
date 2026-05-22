/**
 * This file is superseded by app/(player)/page.tsx which serves the same `/` path.
 * DELETE this file — it causes a Next.js routing conflict with the (player) route group.
 * `tsc --noEmit` passes with both files present; `next build` will error until this is removed.
 */
import { notFound } from "next/navigation";

export default function LegacyRoot() {
  notFound();
}
