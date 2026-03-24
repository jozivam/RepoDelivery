"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch, getSession } from "@/lib/client-auth";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PLACED:          { label: "Recebido",      cls: "badge-yellow" },
  PREPARING:       { label: "Preparando",    cls: "badge-orange" },
  READY:           { label: "Pronto",        cls: "badge-green"  },
  OUT_FOR_DELIVERY:{ label: "Em entrega",    cls: "badge-orange" },
  DELIVERED:       { label: "Entregue",      cls: "badge-green"  },
  CANCELLED:       { label: "Cancelado",     cls: "badge-red"    },
};

const NEXT_STATUS: Record<string, string> = {
  PLACED: "PREPARING",
  PREPARING: "READY",
  READY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const token = getSession()?.token;

  const load = useCallback(async () => {
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      const data = await authFetch(`/orders${qs}`, {}, token);
      setOrders((data as Order[]).reverse());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, token]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  async function advanceStatus(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(order.id);
    try {
      await authFetch(
        `/orders/${order.id}/status`,
        { method: "PATCH", body: JSON.stringify({ status: next }) },
        token
      );
      await load();
      if (selected?.id === order.id) {
        setSelected({ ...order, status: next });
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao atualizar.");
    } finally {
      setUpdating(null);
    }
  }

  const filters = ["", "PLACED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Pedidos</h1>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
            Atualização automática a cada 10s
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load} style={{ fontSize: 12 }}>
          ↻ Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const s = STATUS_LABEL[f];
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="btn"
              style={{
                padding: "5px 14px",
                fontSize: 12,
                background: statusFilter === f ? "var(--accent)" : "var(--surface)",
                color: statusFilter === f ? "#fff" : "var(--fg)",
                border: `1px solid ${statusFilter === f ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {f === "" ? "Todos" : s?.label ?? f}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div className="spinner" style={{ margin: "0 auto", borderTopColor: "var(--accent)", borderColor: "var(--border)" }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <p style={{ color: "var(--muted)", margin: 0 }}>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((order) => {
            const st = STATUS_LABEL[order.status] ?? { label: order.status, cls: "badge-gray" };
            const canAdvance = !!NEXT_STATUS[order.status];
            return (
              <div
                key={order.id}
                className="card"
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transition: "box-shadow 0.15s",
                }}
                onClick={() => setSelected(order)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>#{order.code}</span>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                    <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: "auto" }}>
                      {timeAgo(order.createdAt)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{order.customerName}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {order.deliveryAddress}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: "var(--accent)" }}>{fmt(order.total)}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>{order.items.length} item(s)</div>
                </div>
                {canAdvance && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 12, padding: "7px 14px", flexShrink: 0 }}
                    disabled={updating === order.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      advanceStatus(order);
                    }}
                  >
                    {updating === order.id ? (
                      <span className="spinner" />
                    ) : (
                      `→ ${STATUS_LABEL[NEXT_STATUS[order.status]]?.label ?? ""}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalhe */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="card fade-in"
            style={{ maxWidth: 520, width: "100%", padding: 28, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>
                  Pedido #{selected.code}
                </h2>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge ${STATUS_LABEL[selected.status]?.cls ?? "badge-gray"}`}>
                    {STATUS_LABEL[selected.status]?.label ?? selected.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <div className="label">Cliente</div>
                <div style={{ fontWeight: 500 }}>{selected.customerName}</div>
              </div>
              <div>
                <div className="label">Telefone</div>
                <div>{selected.customerPhone}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="label">Endereço</div>
                <div>{selected.deliveryAddress}</div>
              </div>
              {selected.notes && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="label">Observações</div>
                  <div style={{ color: "var(--muted)" }}>{selected.notes}</div>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
              <div className="label" style={{ marginBottom: 10 }}>Itens</div>
              {selected.items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ color: "var(--muted)", marginLeft: 8 }}>x{item.quantity}</span>
                  </div>
                  <div>{fmt(item.total)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "var(--muted)" }}>Subtotal</span>
                <span>{fmt(selected.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "var(--muted)" }}>Entrega</span>
                <span>{fmt(selected.deliveryFee)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontWeight: 700, fontSize: 16 }}>
                <span>Total</span>
                <span style={{ color: "var(--accent)" }}>{fmt(selected.total)}</span>
              </div>
            </div>

            {NEXT_STATUS[selected.status] && (
              <button
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={updating === selected.id}
                onClick={() => advanceStatus(selected)}
              >
                {updating === selected.id ? (
                  <span className="spinner" />
                ) : (
                  `→ Avançar para: ${STATUS_LABEL[NEXT_STATUS[selected.status]]?.label ?? ""}`
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
