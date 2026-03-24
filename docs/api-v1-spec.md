# API v1 — Especificação Inicial

## 1) Objetivo

A API será responsável por:

- autenticação
- autorização por perfil
- controle de matriz e filiais
- catálogo base e catálogo por loja
- estoque por loja
- pedidos públicos
- status de pedido
- entregas
- relatórios
- isolamento de dados

## 2) Padrão da API

- **Base URL:** `/api/v1`
- **Formato:** `application/json`
- **Autenticação:** Bearer Token nas rotas privadas

### Resposta de sucesso

```json
{
  "success": true,
  "data": {}
}
```

### Resposta de erro

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Acesso negado."
  }
}
```

## 3) Módulos da API

- auth
- companies
- branches
- public-store
- products-base
- store-products
- stock
- orders
- deliveries
- reports
- settings

## 4) Endpoints

### 4.1 Auth

- `POST /api/v1/auth/login` — Autentica usuário.
- `POST /api/v1/auth/logout` — Encerra sessão.
- `GET /api/v1/auth/me` — Retorna dados do usuário autenticado.

### 4.2 Companies

- `POST /api/v1/companies` — Cria empresa matriz (**apenas DEV**).
- `GET /api/v1/companies` — Lista matrizes.
- `GET /api/v1/companies/:companyId` — Detalhes da matriz.
- `PATCH /api/v1/companies/:companyId` — Atualiza matriz.

### 4.3 Branches

- `POST /api/v1/companies/:companyId/branches` — Cria filial.
- `GET /api/v1/companies/:companyId/branches` — Lista filiais da matriz.
- `GET /api/v1/branches/:branchId` — Detalhes da filial.
- `PATCH /api/v1/branches/:branchId` — Atualiza filial.
- `GET /api/v1/branches/switch-context/:branchId` — Troca contexto da loja no painel da matriz.

### 4.4 Loja pública

- `GET /api/v1/public/stores/:slug` — Retorna dados públicos da loja.
- `GET /api/v1/public/stores/:slug/products` — Lista produtos visíveis da loja.
- `GET /api/v1/public/stores/:slug/categories` — Lista categorias da loja.

### 4.5 Produtos base da matriz

- `POST /api/v1/products/base` — Cria produto base.
- `GET /api/v1/products/base` — Lista produtos base.
- `PATCH /api/v1/products/base/:productId` — Atualiza produto base.
- `DELETE /api/v1/products/base/:productId` — Desativa produto base.

### 4.6 Produtos da loja

- `POST /api/v1/branches/:branchId/store-products` — Cria produto operacional da loja.
  - herdado da matriz com preço herdado
  - herdado da matriz com preço próprio
  - produto exclusivo da loja
- `GET /api/v1/branches/:branchId/store-products` — Lista produtos da loja.
- `PATCH /api/v1/store-products/:storeProductId` — Atualiza produto da loja.
- `DELETE /api/v1/store-products/:storeProductId` — Desativa produto da loja.

### 4.7 Estoque

- `GET /api/v1/branches/:branchId/stock` — Lista estoque da loja.
- `POST /api/v1/stock/entry` — Registra entrada de estoque.
- `POST /api/v1/stock/adjustment` — Registra ajuste manual.
- `GET /api/v1/stock/movements` — Lista movimentações.

### 4.8 Pedidos

- `POST /api/v1/public/orders` — Cria pedido na loja pública.
  - identificar loja pelo slug
  - validar produtos
  - validar estoque
  - calcular total
  - criar pedido
  - criar itens
  - baixar estoque
  - registrar saída
- `GET /api/v1/orders` — Lista pedidos.
- `GET /api/v1/orders/:orderId` — Detalhes do pedido.
- `PATCH /api/v1/orders/:orderId/status` — Atualiza status do pedido.
- `GET /api/v1/public/orders/:orderId/tracking` — Retorna rastreio público.

### 4.9 Entregas

- `POST /api/v1/deliveries/assign` — Atribui pedido ao entregador.
- `GET /api/v1/deliveries/my` — Lista entregas do entregador.
- `PATCH /api/v1/deliveries/:deliveryId/status` — Atualiza status da entrega.

### 4.10 Relatórios

- `GET /api/v1/reports/sales-summary` — Resumo de vendas.
- `GET /api/v1/reports/top-products` — Produtos mais vendidos.
- `GET /api/v1/reports/low-stock` — Produtos com estoque baixo.

### 4.11 Configurações da loja

- `GET /api/v1/branches/:branchId/settings` — Busca configurações da loja.
- `PATCH /api/v1/branches/:branchId/settings` — Atualiza configurações da loja.

## 5) Regras obrigatórias da API

1. **Isolamento:** uma filial nunca pode acessar dados de outra.
2. **Contexto da matriz:** a matriz pode operar por contexto de loja selecionada.
3. **Estoque individual:** toda loja tem estoque próprio.
4. **Preço herdado ou personalizado:** produto pode usar preço da matriz ou preço próprio.
5. **Pedido por loja:** todo pedido pertence a uma loja.
6. **Baixa automática:** toda venda gera movimentação de estoque.
7. **Produção:** usar seed opcional para desenvolvimento; nunca depender de dados hardcoded em produção.

## 6) Estrutura técnica sugerida

### Stack

- Next.js
- Supabase Auth
- PostgreSQL
- Route Handlers
- Zod
- Tailwind
- RLS no banco

### Estrutura de pastas

```txt
src/
  app/
    api/
      v1/
        auth/
        companies/
        branches/
        public/
        products/
        store-products/
        stock/
        orders/
        deliveries/
        reports/
  modules/
    auth/
    companies/
    branches/
    products/
    stock/
    orders/
    deliveries/
    reports/
  lib/
    db/
    auth/
    permissions/
    validations/
    errors/
```

## 7) Principais tabelas esperadas

- companies
- branches
- users
- categories
- base_products
- store_products
- stock
- stock_movements
- orders
- order_items
- deliveries
- branch_settings
