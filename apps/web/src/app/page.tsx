/**
 * TODO: Delete this file once Next.js supports it (or manually remove).
 * It creates a routing conflict with app/(player)/page.tsx.
 * For now, redirect to /jogos so the player layout renders correctly.
 */
import { redirect } from "next/navigation";

export default function RootRedirect() {
  redirect("/jogos");
}
