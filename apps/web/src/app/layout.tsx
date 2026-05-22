import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Casino Platform",
    template: "%s | Casino Platform",
  },
  description: "Plataforma de cassino online — demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-background text-text-primary font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
