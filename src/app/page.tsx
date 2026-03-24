const foundationItems = [
  "Next.js App Router com TypeScript",
  "Tailwind CSS configurado para a aplicação",
  "Integração inicial com Supabase",
  "Variáveis de ambiente tipadas",
  "Estrutura base preparada para autenticação e módulos"
];

const nextSteps = [
  "Modelagem do banco multi-tenant no Supabase",
  "RLS por empresa, filial e entregador",
  "API v1 com validação por Zod",
  "Service layer para regras críticas do pedido e estoque"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12 md:px-10">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_20px_80px_rgba(73,46,24,0.08)] backdrop-blur md:grid-cols-[1.4fr_0.8fr] md:p-10">
        <div className="space-y-6">
          <span className="inline-flex w-fit rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-dark)]">
            Fase 1
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              Fundação técnica do SaaS de delivery multi-tenant.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-black/70 md:text-lg">
              A base do projeto foi reorganizada para seguir a ordem correta de construção:
              estrutura, autenticação, banco, permissões, API e depois interface.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[var(--accent)]/12 px-4 py-2 font-medium text-[var(--accent-dark)]">
              /api/v1
            </span>
            <span className="rounded-full bg-black/5 px-4 py-2 font-medium">
              Supabase Auth
            </span>
            <span className="rounded-full bg-black/5 px-4 py-2 font-medium">
              PostgreSQL + RLS
            </span>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/50">
            Ambiente
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-black/50">URL pública</dt>
              <dd className="mt-1 break-all font-mono">{process.env.NEXT_PUBLIC_APP_URL ?? "defina em .env.local"}</dd>
            </div>
            <div>
              <dt className="font-medium text-black/50">Supabase URL</dt>
              <dd className="mt-1 break-all font-mono">{process.env.NEXT_PUBLIC_SUPABASE_URL ?? "defina em .env.local"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/70 p-7">
          <h2 className="text-xl font-semibold">Base entregue agora</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-black/72">
            {foundationItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[#221a14] p-7 text-[#f7ead9]">
          <h2 className="text-xl font-semibold">Próximo corte recomendado</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#f7ead9]/82">
            {nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
