export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
      <section className="w-full rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-[0_20px_80px_rgba(73,46,24,0.08)] backdrop-blur">
        <span className="inline-flex rounded-full bg-[var(--accent)]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-dark)]">
          Auth Setup
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          Login será conectado ao Supabase Auth na próxima etapa.
        </h1>
        <p className="mt-4 text-sm leading-6 text-black/70">
          Esta página existe para fechar a fundação do App Router com middleware e sessão.
          O fluxo real de autenticação deve entrar junto com os papéis, políticas e banco.
        </p>
      </section>
    </main>
  );
}
