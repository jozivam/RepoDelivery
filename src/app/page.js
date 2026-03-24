const demoUsers = [
  { role: "DEV", email: "dev@repodelivery.local", password: "dev123456" },
  { role: "COMPANY_ADMIN", email: "owner@acme.local", password: "owner123" },
  { role: "BRANCH_MANAGER", email: "manager@centro.local", password: "manager123" },
  { role: "DELIVERY", email: "rider@centro.local", password: "delivery123" }
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px 72px" }}>
      <h1 style={{ fontSize: 42, marginBottom: 8 }}>Repo Delivery API v1</h1>
      <p style={{ fontSize: 18, maxWidth: 720, lineHeight: 1.6 }}>
        Backend inicial para autenticação, matriz, filiais, catálogo, estoque, pedidos,
        entregas, relatórios e configurações da loja.
      </p>
      <section style={{ marginTop: 40, padding: 24, borderRadius: 18, background: "#fffdf7", border: "1px solid #d8d2c4" }}>
        <h2 style={{ marginTop: 0 }}>Entradas úteis</h2>
        <p>
          Base: <code>/api/v1</code>
        </p>
        <p>
          Documentação: <code>/docs/api-v1-spec.md</code> e <code>/docs/openapi-v1.yaml</code>
        </p>
      </section>
      <section style={{ marginTop: 24, padding: 24, borderRadius: 18, background: "#1f4037", color: "#f5f1e8" }}>
        <h2 style={{ marginTop: 0 }}>Usuários seed de desenvolvimento</h2>
        <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
          {demoUsers.map((user) => (
            <li key={user.email} style={{ marginBottom: 10 }}>
              <strong>{user.role}</strong>: <code>{user.email}</code> / <code>{user.password}</code>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
