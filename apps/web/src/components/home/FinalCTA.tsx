import Link from "next/link";
import { Lock, Shield, UserCheck } from "lucide-react";
import { Button } from "@casino/ui";

const TRUST_ITEMS = [
  {
    icon: Lock,
    title: "Dados protegidos",
    desc: "Criptografia SSL 256-bit",
  },
  {
    icon: Shield,
    title: "Plataforma segura",
    desc: "Auditada e certificada",
  },
  {
    icon: UserCheck,
    title: "Jogo responsável",
    desc: "Somente maiores de 18 anos",
  },
] as const;

export function FinalCTA() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative z-10 overflow-hidden"
    >
      {/* Gradient separator from page background */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(255,184,0,0.05) 0%, transparent 70%),
            linear-gradient(to bottom, #0D1220 0%, #0A0E1A 100%)
          `,
        }}
      />

      <div className="relative z-10 px-4 sm:px-6 py-20 text-center max-w-2xl mx-auto">
        {/* Eyebrow */}
        <p className="text-[11px] font-bold text-accent-primary uppercase tracking-widest mb-3">
          Comece agora
        </p>

        {/* Heading */}
        <h2
          id="final-cta-heading"
          className="font-heading font-black text-text-primary leading-tight"
          style={{ fontSize: "clamp(28px, 5vw, 52px)" }}
        >
          Pronto para começar?
        </h2>
        <p className="mt-3 text-text-secondary text-sm sm:text-base max-w-md mx-auto">
          Crie sua conta em menos de 60 segundos e ganhe{" "}
          <span className="text-accent-primary font-semibold">R$ 1.000</span> em
          créditos demo para explorar todos os jogos.
        </p>

        {/* CTA */}
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="text-base sm:text-lg font-bold px-10 py-6 h-auto shadow-glow-primary"
          >
            <Link href="/register">Criar conta grátis →</Link>
          </Button>
          <p className="mt-3 text-xs text-text-muted">
            Sem cartão de crédito. Sem depósito obrigatório.
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-surface-elevated border border-border-default shrink-0">
                <Icon
                  size={18}
                  className="text-accent-primary"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {title}
                </p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
