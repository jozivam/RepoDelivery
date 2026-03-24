"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, clearSession, apiLogout, type AuthUser } from "@/lib/client-auth";

const NAV = [
  {
    href: "/admin/orders",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    label: "Pedidos",
    roles: ["DEV", "COMPANY_ADMIN", "BRANCH_MANAGER"],
  },
  {
    href: "/admin/stock",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Estoque",
    roles: ["DEV", "COMPANY_ADMIN", "BRANCH_MANAGER"],
  },
  {
    href: "/admin/reports",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Relatórios",
    roles: ["DEV", "COMPANY_ADMIN", "BRANCH_MANAGER"],
  },
  {
    href: "/admin/deliveries",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Entregas",
    roles: ["DEV", "COMPANY_ADMIN", "BRANCH_MANAGER", "DELIVERY"],
  },
];

function Sidebar({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const pathname = usePathname();

  const roleLabel: Record<string, string> = {
    DEV: "Dev Root",
    COMPANY_ADMIN: "Admin",
    BRANCH_MANAGER: "Gerente",
    DELIVERY: "Entregador",
  };

  const visible = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--sidebar-bg)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "var(--accent)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
              RepoDelivery
            </div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
              Painel de controle
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {visible.map((item) => {
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                color: active ? "var(--sidebar-active-fg)" : "var(--sidebar-fg)",
                background: active ? "var(--sidebar-active)" : "transparent",
                fontWeight: active ? 600 : 400,
                marginBottom: 2,
                transition: "all 0.15s",
                fontSize: 13,
              }}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}

        {/* Link loja pública */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <a
            href="/loja/loja-centro"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              color: "var(--sidebar-fg)",
              fontSize: 13,
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-10 2a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Loja Pública ↗
          </a>
        </div>
      </nav>

      {/* User */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>
            {user.name}
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
            {roleLabel[user.role] ?? user.role}
          </div>
        </div>
        <button
          onClick={onLogout}
          className="btn"
          style={{
            width: "100%",
            justifyContent: "center",
            background: "rgba(239,68,68,0.12)",
            color: "#f87171",
            border: "none",
            fontSize: 12,
            padding: "7px 12px",
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session.user);
    setReady(true);
  }, [router]);

  async function handleLogout() {
    const session = getSession();
    if (session) {
      try {
        await apiLogout(session.token);
      } catch (_) { /* ignora */ }
    }
    clearSession();
    router.push("/login");
  }

  if (!ready || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner" style={{ borderTopColor: "var(--accent)", borderColor: "rgba(210,100,42,0.2)" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar user={user} onLogout={handleLogout} />
      <main
        style={{
          flex: 1,
          padding: "28px 32px",
          overflowY: "auto",
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
