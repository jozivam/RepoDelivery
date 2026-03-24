"use client";

import React, { useEffect, useState } from "react";
import { authFetch, getSession } from "@/lib/client-auth";

interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  period?: string;
}

interface TopProduct {
  productName: string;
  totalQty: number;
  totalRevenue: number;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const StatCard = ({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) => (
  <div className="card" style={{ padding: "20px 24px" }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
      {label}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "var(--fg)" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
  </div>
);

export default function ReportsPage() {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getSession()?.token;

  useEffect(() => {
    async function load() {
      try {
        const [s, t] = await Promise.all([
          authFetch("/reports/sales-summary", {}, token),
          authFetch("/reports/top-products", {}, token),
        ]);
        setSummary(s as SalesSummary);
        setTop(t as TopProduct[]);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
        <div className="spinner" style={{ borderTopColor: "var(--accent)", borderColor: "var(--border)" }} />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Relatórios</h1>
        <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
          Resumo de vendas e produtos mais vendidos
        </p>
      </div>

      {summary ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <StatCard
              label="Total de Pedidos"
              value={String(summary.totalOrders)}
              color="var(--accent)"
            />
            <StatCard
              label="Receita Total"
              value={fmt(summary.totalRevenue)}
              color="#16a34a"
            />
            <StatCard
              label="Ticket Médio"
              value={fmt(summary.averageTicket ?? 0)}
            />
          </div>

          {top.length > 0 ? (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
                🏆 Top Produtos
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["#", "Produto", "Qtd Vendida", "Receita"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {top.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--muted)", fontWeight: 700 }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 500 }}>{p.productName}</td>
                      <td style={{ padding: "12px 16px" }}>{p.totalQty}</td>
                      <td style={{ padding: "12px 16px", color: "#16a34a", fontWeight: 600 }}>
                        {fmt(p.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "var(--muted)", margin: 0 }}>Nenhum produto vendido ainda</p>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Selecione uma filial para ver os relatórios
          </p>
        </div>
      )}
    </div>
  );
}
