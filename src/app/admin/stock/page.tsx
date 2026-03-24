"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch, getSession } from "@/lib/client-auth";

interface StockItem {
  id: string;
  productName: string;
  currentQty: number;
  unit: string;
  minQty: number;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR");
}

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getSession()?.token;

  const load = useCallback(async () => {
    try {
      const [movements, low] = await Promise.all([
        authFetch("/stock/movements", {}, token),
        authFetch("/reports/low-stock", {}, token),
      ]);
      setStock(movements as StockItem[]);
      setLowStock(low as StockItem[]);
    } catch (_) {
      // sem branch ctx pode não retornar nada
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Estoque</h1>
        <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
          Movimentações e alertas de estoque baixo
        </p>
      </div>

      {lowStock.length > 0 && (
        <div
          style={{
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.18)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 600, color: "#dc2626", marginBottom: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span>⚠️</span> Produtos com estoque abaixo do mínimo
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {lowStock.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>{item.productName}</span>
                <span style={{ color: "#dc2626", fontWeight: 600 }}>
                  {fmt(item.currentQty)} {item.unit} (mín: {fmt(item.minQty)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div className="spinner" style={{ margin: "0 auto", borderTopColor: "var(--accent)", borderColor: "var(--border)" }} />
        </div>
      ) : stock.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Nenhuma movimentação registrada. Selecione uma filial no contexto para visualizar.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Produto", "Qtd Atual", "Unidade", "Qtd Mínima", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stock.map((item, i) => {
                const low = item.currentQty <= item.minQty;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{item.productName}</td>
                    <td style={{ padding: "12px 16px", color: low ? "#dc2626" : undefined, fontWeight: low ? 700 : 400 }}>
                      {fmt(item.currentQty)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{item.unit}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{fmt(item.minQty)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className={`badge ${low ? "badge-red" : "badge-green"}`}>
                        {low ? "Baixo" : "Ok"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
