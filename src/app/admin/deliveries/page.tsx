"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch, getSession } from "@/lib/client-auth";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:      { label: "Pendente",   cls: "badge-yellow" },
  ASSIGNED:     { label: "Atribuída",  cls: "badge-orange" },
  PICKED_UP:    { label: "Coletada",   cls: "badge-orange" },
  DELIVERED:    { label: "Entregue",   cls: "badge-green"  },
  FAILED:       { label: "Falhou",     cls: "badge-red"    },
};

const NEXT: Record<string, string> = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "DELIVERED",
};

interface Delivery {
  id: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  deliveryAddress: string;
  status: string;
  assignedAt: string;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  return `${Math.floor(diff / 3600)}h`;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const token = getSession()?.token;

  const load = useCallback(async () => {
    try {
      const data = await authFetch("/deliveries/my", {}, token);
      setDeliveries((data as Delivery[]).reverse());
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function advanceStatus(d: Delivery) {
    const next = NEXT[d.status];
    if (!next) return;
    setUpdating(d.id);
    try {
      await authFetch(
        `/deliveries/${d.id}/status`,
        { method: "PATCH", body: JSON.stringify({ status: next }) },
        token
      );
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Minhas Entregas</h1>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
            Atualize o status das entregas em tempo real
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load} style={{ fontSize: 12 }}>
          ↻ Atualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div className="spinner" style={{ margin: "0 auto", borderTopColor: "var(--accent)", borderColor: "var(--border)" }} />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚚</div>
          <p style={{ color: "var(--muted)", margin: 0 }}>Nenhuma entrega atribuída</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {deliveries.map((d) => {
            const st = STATUS_LABEL[d.status] ?? { label: d.status, cls: "badge-gray" };
            return (
              <div key={d.id} className="card" style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>#{d.orderCode}</span>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                    <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: "auto" }}>
                      {timeAgo(d.assignedAt)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 500 }}>{d.customerName}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
                    📍 {d.deliveryAddress}
                  </div>
                </div>
                {NEXT[d.status] && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 12, flexShrink: 0 }}
                    disabled={updating === d.id}
                    onClick={() => advanceStatus(d)}
                  >
                    {updating === d.id ? <span className="spinner" /> : `→ ${STATUS_LABEL[NEXT[d.status]]?.label ?? ""}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
