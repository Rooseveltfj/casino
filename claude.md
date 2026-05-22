# Casino Platform — guia do projeto

## Contexto
Plataforma white-label de cassino online (slots, ao vivo, sportsbook) construída pra ser
vendida ao operador licenciado. MVP roda em modo DEMO (saldo fictício, sem dinheiro real)
pra apresentação comercial. Arquitetura pronta pra ligar produção real (Pragmatic, Evolution,
PSP de gambling) trocando configs sem refatorar.

## Princípios não-negociáveis
1. Type-safety end-to-end. Zero `any`, zero `as unknown as`. Use Zod pra runtime + tipos derivados.
2. Wallet é double-entry ledger append-only. NUNCA UPDATE em transactions, só INSERT.
   Saldo é calculado por agregação (view materializada).
3. Toda operação financeira é idempotente. Cliente envia idempotency_key, servidor garante.
4. Todo callback de provider passa por verificação de assinatura HMAC.
5. RBAC obrigatório: player, support, finance, admin, superadmin.
6. Mobile-first sempre. Design começa em 375px e expande.
7. Acessibilidade: foco visível, ARIA, prefers-reduced-motion respeitado.

## Stack
- Monorepo: Turborepo + pnpm workspaces
- Frontend: Next.js 15 App Router + Tailwind v4 + shadcn/ui + Aceternity + motion
- Backend: NestJS + Fastify + Drizzle ORM + PostgreSQL (Supabase)
- Cache/filas: Redis (Upstash) + BullMQ
- Auth: Better-Auth com RBAC + 2FA TOTP
- Validação: Zod v4 (schema único compartilhado)
- Jogos: Phaser 3 + Matter.js
- WebSocket: Socket.IO

## Identidade visual
- Tema dark obrigatório (cassino é noturno)
- Background: #0A0E1A (azul-petróleo bem escuro, não preto puro)
- Surface: #131826
- Accent primário: #00D4FF (ciano elétrico, energia)
- Accent secundário: #FFB800 (dourado, vitória/prêmio)
- Sucesso: #00F5A0 / Erro: #FF3D71 / Aviso: #FFAA00
- Tipografia heading: Satoshi (geométrica moderna, alternativa pago-free)
- Tipografia corpo: Inter
- Tipografia mono: JetBrains Mono (valores, IDs)
- Border radius: 12px padrão, 8px compacto, 20px hero
- Sombras com glow sutil em accent nos elementos interativos

## Anti-padrões
- Sem alert()/confirm() — sempre componente customizado
- Sem inline styles, sempre Tailwind
- Sem useEffect pra fetch — sempre TanStack Query no client / Server Components no server
- Sem any. Sem @ts-ignore. Sem ts-expect-error sem comentário explicando
- Componentes Server por padrão; "use client" só quando necessário
- Sem console.log em commit — usar logger.info/debug/error
- Sem hardcode de strings em UI — passar por i18n desde o início

## Pastas (manter rígido)
- apps/web/src/app/(player)/ — rotas públicas do jogador
- apps/web/src/app/(admin)/admin/ — backoffice (auth-guarded RBAC)
- apps/web/src/app/api/ — apenas BFF leve; lógica pesada no NestJS
- apps/api/src/modules/ — um módulo NestJS por domínio (wallet, game, auth, etc.)
- packages/database/src/schema/ — um arquivo por tabela
- packages/shared/src/schemas/ — Zod schemas (compartilhados front+back)
