"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";

interface StoreInfo {
  name: string;
  description: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  baseProduct?: { name: string; description: string; price: number };
}

interface CartItem {
  product: Product;
  qty: number;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([
          fetch(`/api/v1/public/stores/${slug}`).then((r) => r.json()),
          fetch(`/api/v1/public/stores/${slug}/products`).then((r) => r.json()),
        ]);
        if (s.success) setStore(s.data);
        if (p.success) setProducts(p.data);
      } catch (_) {
        setError("Não foi possível carregar a loja.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.product.id !== id));
  }

  function cartTotal() {
    return cart.reduce((acc, c) => acc + c.product.price * c.qty, 0);
  }

  async function placeOrder() {
    if (!orderForm.name || !orderForm.phone || !orderForm.address) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const res = await fetch("/api/v1/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customerName: orderForm.name,
          customerPhone: orderForm.phone,
          deliveryAddress: orderForm.address,
          notes: orderForm.notes,
          items: cart.map((c) => ({ storeProductId: c.product.id, quantity: c.qty })),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Erro ao fazer pedido");
      setSuccess(`Pedido #${json.data.code} realizado com sucesso! 🎉`);
      setCart([]);
      setShowOrder(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao fazer pedido");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ borderTopColor: "var(--accent)", borderColor: "var(--border)", width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--sidebar-bg)",
          padding: "20px 24px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>
              {store?.name ?? slug}
            </h1>
            {store?.address && (
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "3px 0 0" }}>
                📍 {store.address}
              </p>
            )}
          </div>
          {cart.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={() => setShowOrder(true)}
              style={{ position: "relative" }}
            >
              🛒 Ver carrinho
              <span
                style={{
                  position: "absolute",
                  top: -6, right: -6,
                  background: "#fff",
                  color: "var(--accent)",
                  borderRadius: 999,
                  width: 18, height: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                }}
              >
                {cart.reduce((a, c) => a + c.qty, 0)}
              </span>
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {success && (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius)", padding: "14px 18px", color: "#16a34a", marginBottom: 20, fontWeight: 500 }}>
            {success}
          </div>
        )}

        {store?.description && (
          <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>{store.description}</p>
        )}

        {products.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🍽️</div>
            <p style={{ color: "var(--muted)", margin: 0 }}>Sem produtos disponíveis no momento</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {products.map((product) => {
              const inCart = cart.find((c) => c.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className="card"
                  style={{ padding: 20, display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      background: "var(--accent-light)",
                      borderRadius: 10,
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 36,
                      marginBottom: 14,
                    }}
                  >
                    🍽️
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{product.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, flex: 1, marginBottom: 14 }}>
                    {product.description}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>
                      {fmt(product.price)}
                    </span>
                    {inCart ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => {
                            if (inCart.qty > 1) {
                              setCart((prev) => prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty - 1 } : c));
                            } else {
                              removeFromCart(product.id);
                            }
                          }}
                          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          −
                        </button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{inCart.qty}</span>
                        <button
                          onClick={() => addToCart(product)}
                          style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => addToCart(product)}>
                        + Adicionar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal carrinho / checkout */}
      {showOrder && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50, padding: 0 }}
          onClick={() => setShowOrder(false)}
        >
          <div
            className="card fade-in"
            style={{ width: "100%", maxWidth: 520, borderRadius: "20px 20px 0 0", padding: 28, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Finalizar Pedido</h2>
              <button onClick={() => setShowOrder(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {/* Itens */}
            <div style={{ marginBottom: 20 }}>
              {cart.map((c) => (
                <div key={c.product.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{c.product.name} x{c.qty}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(c.product.price * c.qty)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: "var(--accent)" }}>{fmt(cartTotal())}</span>
              </div>
            </div>

            {/* Formulário */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label" htmlFor="cname">Nome *</label>
                <input id="cname" className="input" value={orderForm.name} onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })} placeholder="Seu nome" />
              </div>
              <div>
                <label className="label" htmlFor="cphone">Telefone *</label>
                <input id="cphone" className="input" value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="label" htmlFor="caddr">Endereço de entrega *</label>
                <input id="caddr" className="input" value={orderForm.address} onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })} placeholder="Rua, número, bairro" />
              </div>
              <div>
                <label className="label" htmlFor="cnotes">Observações</label>
                <textarea id="cnotes" className="input" rows={2} value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} placeholder="Ex: sem cebola, interfone 301..." style={{ resize: "vertical" }} />
              </div>
            </div>

            {error && (
              <div style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{error}</div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 20, height: 44 }}
              disabled={placing}
              onClick={placeOrder}
            >
              {placing ? <span className="spinner" /> : "✓ Confirmar pedido"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
