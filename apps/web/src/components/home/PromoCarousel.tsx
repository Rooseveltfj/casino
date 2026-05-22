"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Gift } from "lucide-react";
import { Button } from "@casino/ui";
import { useReducedMotion } from "motion/react";

// ── Static promo data ─────────────────────────────────────────────────────────

const PROMOS = [
  {
    id: "welcome",
    eyebrow: "Novo aqui?",
    title: "Bônus de Boas-vindas",
    description: "Receba até R$ 500 no seu primeiro depósito. Use o código CASINO500.",
    cta: "Resgatar agora",
    href: "/promocoes/boas-vindas",
    gradient: "from-cyan-950 via-[#001a2a] to-[#0A0E1A]",
    accent: "#00D4FF",
    icon: "🎁",
  },
  {
    id: "cashback",
    eyebrow: "Toda segunda-feira",
    title: "Cashback de 10%",
    description: "Perdeu na semana? Devolvemos 10% do valor das suas apostas líquidas.",
    cta: "Participar",
    href: "/promocoes/cashback",
    gradient: "from-amber-950 via-[#1a1000] to-[#0A0E1A]",
    accent: "#FFB800",
    icon: "💰",
  },
  {
    id: "freespins",
    eyebrow: "Toda quinta-feira",
    title: "50 Free Spins",
    description: "Giros grátis no slot da semana, sem necessidade de depósito adicional.",
    cta: "Girar agora",
    href: "/promocoes/free-spins",
    gradient: "from-purple-950 via-[#1a0a2a] to-[#0A0E1A]",
    accent: "#8B5CF6",
    icon: "🎰",
  },
] as const;

// ── Dot indicators ────────────────────────────────────────────────────────────

function DotIndicators({
  count,
  selected,
  onSelect,
}: {
  count: number;
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Slides de promoção"
      className="flex items-center gap-2 justify-center mt-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === selected}
          aria-label={`Slide ${i + 1}`}
          onClick={() => onSelect(i)}
          className={`rounded-full transition-all duration-300 ${
            i === selected
              ? "w-6 h-2 bg-accent-primary"
              : "w-2 h-2 bg-border-strong hover:bg-text-muted"
          }`}
        />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PromoCarousel() {
  const prefersReduced = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoplay = Autoplay({
    delay: 5000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    prefersReduced ? [] : [autoplay],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section
      aria-labelledby="promo-heading"
      className="relative z-10 px-4 sm:px-6 py-12 max-w-screen-2xl mx-auto"
    >
      <div className="mb-6">
        <p className="text-[11px] font-bold text-accent-primary uppercase tracking-widest mb-1">
          Promoções
        </p>
        <h2
          id="promo-heading"
          className="font-heading text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2"
        >
          <Gift size={20} className="text-accent-secondary" aria-hidden="true" />
          Ofertas ativas agora
        </h2>
      </div>

      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {PROMOS.map((promo) => (
            <div
              key={promo.id}
              className="min-w-full sm:min-w-[calc(50%+12px)] lg:min-w-[calc(33.33%+16px)] flex-shrink-0 pl-0 pr-4"
            >
              <div
                className={`relative h-44 sm:h-52 rounded-xl overflow-hidden bg-gradient-to-r ${promo.gradient} border border-border-subtle`}
              >
                {/* Glow accent */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(ellipse 60% 80% at 90% 50%, ${promo.accent}, transparent)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 max-w-sm">
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: promo.accent }}
                  >
                    {promo.eyebrow}
                  </span>
                  <h3 className="font-heading text-lg sm:text-2xl font-black text-text-primary leading-tight">
                    {promo.icon} {promo.title}
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm mt-2 leading-relaxed line-clamp-2">
                    {promo.description}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="mt-4 self-start font-semibold"
                    style={{
                      background: promo.accent,
                      color: "#0A0E1A",
                      boxShadow: `0 0 16px ${promo.accent}60`,
                    }}
                  >
                    <Link href={promo.href}>{promo.cta}</Link>
                  </Button>
                </div>

                {/* Decorative large emoji */}
                <div
                  aria-hidden="true"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl sm:text-8xl opacity-15 select-none"
                >
                  {promo.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <DotIndicators
        count={PROMOS.length}
        selected={selectedIndex}
        onSelect={(i) => emblaApi?.scrollTo(i)}
      />
    </section>
  );
}
