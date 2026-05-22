import Link from "next/link";
import { Logo } from "@casino/ui";
import { Separator } from "@casino/ui";

const FOOTER_COLUMNS = [
  {
    title: "Sobre",
    links: [
      { label: "Quem somos", href: "/sobre" },
      { label: "Termos de uso", href: "/termos" },
      { label: "Política de privacidade", href: "/privacidade" },
      { label: "Política de cookies", href: "/cookies" },
    ],
  },
  {
    title: "Jogue Responsável",
    links: [
      { label: "Auto-exclusão", href: "/auto-exclusao" },
      { label: "Limites de depósito", href: "/limites" },
      { label: "Ajuda e recursos", href: "/ajuda" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Central de ajuda", href: "/faq" },
      { label: "Chat ao vivo", href: "/chat" },
      { label: "E-mail suporte", href: "mailto:suporte@demo.local" },
      { label: "Status do sistema", href: "/status" },
    ],
  },
  {
    title: "Métodos de Pagamento",
    links: [
      { label: "Depósito via Pix", href: "/carteira/deposito" },
      { label: "Saque via Pix", href: "/carteira/saque" },
      { label: "Limites e taxas", href: "/carteira/limites" },
      { label: "Histórico", href: "/carteira/historico" },
    ],
  },
] as const;

const PROVIDERS = [
  "Pragmatic Play",
  "PG Soft",
  "Evolution",
  "Hacksaw Gaming",
  "Nolimit City",
] as const;

export function PlayerFooter() {
  return (
    <footer className="bg-surface border-t border-border-subtle mt-auto">
      {/* Main columns */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {FOOTER_COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Provider logos row */}
        <Separator className="my-8 opacity-40" />
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-xs text-text-muted">Provedores:</span>
          {PROVIDERS.map((name) => (
            <span
              key={name}
              className="text-xs font-medium text-text-muted opacity-50 hover:opacity-80 transition-opacity border border-border-subtle px-2.5 py-1 rounded"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-border-subtle bg-background/50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size={24} />
            <span className="text-xs text-text-muted">
              Casino Platform Demo © {new Date().getFullYear()} — Apenas para fins
              demonstrativos. Sem dinheiro real.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-text-muted border border-border-default px-2 py-0.5 rounded">
              Licença Demo
            </span>
            <span className="text-sm font-bold text-text-secondary bg-surface-elevated border border-border-default w-8 h-8 rounded flex items-center justify-center">
              18+
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
