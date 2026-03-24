"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin, saveSession } from "@/lib/client-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("dev@repodelivery.local");
  const [password, setPassword] = useState("dev123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await apiLogin(email, password);
      saveSession(session);
      router.push("/admin/orders");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  const hints = [
    { role: "DEV", email: "dev@repodelivery.local", pw: "dev123456" },
    { role: "Admin", email: "owner@acme.local", pw: "owner123" },
    { role: "Gerente", email: "manager@centro.local", pw: "manager123" },
    { role: "Entregador", email: "rider@centro.local", pw: "delivery123" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(ellipse at top left, rgba(210,100,42,0.12), transparent 50%), var(--bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
          }}
          className="fade-in"
        >
          <div
            style={{
              width: 52,
              height: 52,
              background: "var(--accent)",
              borderRadius: 14,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              boxShadow: "0 4px 20px rgba(210,100,42,0.3)",
            }}
          >
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="19" cy="19" r="5" fill="#fff" opacity="0.9" />
              <path d="M17 19l1.5 1.5L21 17.5" stroke="#d2642a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>
            RepoDelivery
          </h1>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 13 }}>
            Faça login para acessar o painel
          </p>
        </div>

        {/* Card */}
        <div
          className="card fade-in"
          style={{ padding: 32 }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label className="label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="label" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  color: "#dc2626",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", height: 42 }}
            >
              {loading ? <span className="spinner" /> : "Entrar"}
            </button>
          </form>

          {/* Hints de contas */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Contas de teste
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {hints.map((h) => (
                <button
                  key={h.role}
                  type="button"
                  onClick={() => {
                    setEmail(h.email);
                    setPassword(h.pw);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--accent-light)",
                    border: "1px solid rgba(210,100,42,0.15)",
                    borderRadius: "var(--radius)",
                    padding: "7px 12px",
                    cursor: "pointer",
                    transition: "background 0.1s",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--accent)",
                    }}
                  >
                    {h.role}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>
                    {h.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
