import crypto from "node:crypto";
import { ApiError, assert } from "@/lib/api";
import { getAuthContext, logout, switchBranchContext } from "@/lib/auth";
import { findById, mutateDb, readDb } from "@/lib/db";
import {
  Roles,
  requireBranchAccess,
  requireCompanyAccess,
  requireRole
} from "@/lib/permissions";

function now() {
  return new Date().toISOString();
}

function toMoney(value) {
  return Number(Number(value).toFixed(2));
}

function scopedBranchIds(db, auth, requestedBranchId) {
  if (requestedBranchId) {
    const branch = findById(db.branches, requestedBranchId, "Filial");
    requireBranchAccess(auth.user, branch);
    return [branch.id];
  }

  if (auth.user.role === Roles.DEV) {
    return db.branches.map((branch) => branch.id);
  }

  if (auth.user.role === Roles.COMPANY_ADMIN) {
    if (auth.session.branchContextId) {
      const branch = findById(db.branches, auth.session.branchContextId, "Filial");
      requireBranchAccess(auth.user, branch);
      return [branch.id];
    }

    return db.branches.filter((branch) => branch.companyId === auth.user.companyId).map((branch) => branch.id);
  }

  return auth.user.branchId ? [auth.user.branchId] : [];
}

function stockEntryForProduct(db, branchId, storeProductId) {
  return db.stock.find((entry) => entry.branchId === branchId && entry.storeProductId === storeProductId);
}

function publicBranchSnapshot(db, branch) {
  const settings = db.branchSettings.find((entry) => entry.branchId === branch.id) || null;
  return {
    id: branch.id,
    companyId: branch.companyId,
    name: branch.name,
    slug: branch.slug,
    address: branch.address,
    active: branch.active,
    settings
  };
}

function filterStoreProductsForBranch(db, branchId, { onlyVisible = false } = {}) {
  return db.storeProducts
    .filter((entry) => entry.branchId === branchId && entry.active)
    .filter((entry) => (onlyVisible ? entry.visible : true))
    .map((product) => {
      const baseProduct = product.baseProductId
        ? db.baseProducts.find((entry) => entry.id === product.baseProductId)
        : null;

      const resolvedPrice = product.pricingMode === "INHERITED" && baseProduct
        ? baseProduct.price
        : product.price;

      return {
        ...product,
        price: resolvedPrice,
        baseProduct
      };
    });
}

export async function getMe(request) {
  const auth = await getAuthContext(request);
  return {
    user: auth.user,
    branchContextId: auth.session.branchContextId
  };
}

export async function logoutCurrentSession(request) {
  const auth = await getAuthContext(request);
  await logout(auth.token);
  return { loggedOut: true };
}

export async function listCompanies(request) {
  const auth = await getAuthContext(request);
  const db = await readDb();

  if (auth.user.role === Roles.DEV) {
    return db.companies;
  }

  return db.companies.filter((company) => company.id === auth.user.companyId);
}

export async function createCompany(request, payload) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DEV]);
  assert(payload.name, 400, "VALIDATION_ERROR", "Nome da empresa é obrigatório.");

  return mutateDb((state) => {
    const company = {
      id: crypto.randomUUID(),
      name: payload.name,
      document: payload.document || null,
      active: payload.active ?? true,
      createdAt: now(),
      updatedAt: now()
    };
    state.companies.push(company);
    return company;
  });
}

export async function getCompany(request, companyId) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const company = findById(db.companies, companyId, "Empresa");
  requireCompanyAccess(auth.user, company.id);
  return company;
}

export async function updateCompany(request, companyId, payload) {
  const auth = await getAuthContext(request);

  return mutateDb((state) => {
    const company = findById(state.companies, companyId, "Empresa");
    requireCompanyAccess(auth.user, company.id);
    Object.assign(company, {
      name: payload.name ?? company.name,
      document: payload.document ?? company.document,
      active: payload.active ?? company.active,
      updatedAt: now()
    });
    return company;
  });
}

export async function createBranch(request, companyId, payload) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DEV, Roles.COMPANY_ADMIN]);
  requireCompanyAccess(auth.user, companyId);
  assert(payload.name, 400, "VALIDATION_ERROR", "Nome da filial é obrigatório.");
  assert(payload.slug, 400, "VALIDATION_ERROR", "Slug da filial é obrigatório.");

  return mutateDb((state) => {
    findById(state.companies, companyId, "Empresa");
    const existingSlug = state.branches.find((entry) => entry.slug === payload.slug);
    assert(!existingSlug, 409, "CONFLICT", "Slug da filial já está em uso.");

    const branch = {
      id: crypto.randomUUID(),
      companyId,
      name: payload.name,
      slug: payload.slug,
      address: payload.address || null,
      active: payload.active ?? true,
      createdAt: now(),
      updatedAt: now()
    };

    state.branches.push(branch);
    state.branchSettings.push({
      branchId: branch.id,
      isOpen: true,
      minOrderValue: 0,
      deliveryFee: 0,
      allowPickup: true,
      updatedAt: now()
    });
    return branch;
  });
}

export async function listCompanyBranches(request, companyId) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  requireCompanyAccess(auth.user, companyId);
  return db.branches.filter((branch) => branch.companyId === companyId);
}

export async function getBranch(request, branchId) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const branch = findById(db.branches, branchId, "Filial");
  requireBranchAccess(auth.user, branch);
  return branch;
}

export async function updateBranch(request, branchId, payload) {
  const auth = await getAuthContext(request);

  return mutateDb((state) => {
    const branch = findById(state.branches, branchId, "Filial");
    requireBranchAccess(auth.user, branch);

    if (payload.slug && payload.slug !== branch.slug) {
      const sameSlug = state.branches.find((entry) => entry.slug === payload.slug && entry.id !== branch.id);
      assert(!sameSlug, 409, "CONFLICT", "Slug da filial já está em uso.");
    }

    Object.assign(branch, {
      name: payload.name ?? branch.name,
      slug: payload.slug ?? branch.slug,
      address: payload.address ?? branch.address,
      active: payload.active ?? branch.active,
      updatedAt: now()
    });
    return branch;
  });
}

export async function changeBranchContext(request, branchId) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DEV, Roles.COMPANY_ADMIN, Roles.BRANCH_MANAGER]);
  const branch = findById(auth.db.branches, branchId, "Filial");
  requireBranchAccess(auth.user, branch);
  const session = await switchBranchContext(auth.token, branchId);
  return {
    branchContextId: session.branchContextId
  };
}

export async function getPublicStore(slug) {
  const db = await readDb();
  const branch = db.branches.find((entry) => entry.slug === slug && entry.active);
  if (!branch) {
    throw new ApiError(404, "NOT_FOUND", "Loja não encontrada.");
  }
  return publicBranchSnapshot(db, branch);
}

export async function getPublicStoreProducts(slug) {
  const db = await readDb();
  const branch = db.branches.find((entry) => entry.slug === slug && entry.active);
  if (!branch) {
    throw new ApiError(404, "NOT_FOUND", "Loja não encontrada.");
  }
  return filterStoreProductsForBranch(db, branch.id, { onlyVisible: true });
}

export async function getPublicStoreCategories(slug) {
  const db = await readDb();
  const branch = db.branches.find((entry) => entry.slug === slug && entry.active);
  if (!branch) {
    throw new ApiError(404, "NOT_FOUND", "Loja não encontrada.");
  }

  const categoriesInBranch = new Set(
    filterStoreProductsForBranch(db, branch.id, { onlyVisible: true }).map((product) => product.categoryId).filter(Boolean)
  );

  return db.categories.filter((category) => categoriesInBranch.has(category.id) && category.active);
}

export async function createBaseProduct(request, payload) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DEV, Roles.COMPANY_ADMIN]);
  assert(payload.name, 400, "VALIDATION_ERROR", "Nome do produto é obrigatório.");

  return mutateDb((state) => {
    const companyId = auth.user.role === Roles.DEV
      ? payload.companyId
      : auth.user.companyId;

    assert(companyId, 400, "VALIDATION_ERROR", "companyId é obrigatório.");
    findById(state.companies, companyId, "Empresa");
    requireCompanyAccess(auth.user, companyId);

    const product = {
      id: crypto.randomUUID(),
      companyId,
      categoryId: payload.categoryId || null,
      name: payload.name,
      description: payload.description || null,
      price: toMoney(payload.price || 0),
      active: payload.active ?? true,
      createdAt: now(),
      updatedAt: now()
    };
    state.baseProducts.push(product);
    return product;
  });
}

export async function listBaseProducts(request) {
  const auth = await getAuthContext(request);
  const db = await readDb();

  if (auth.user.role === Roles.DEV) {
    return db.baseProducts;
  }

  return db.baseProducts.filter((product) => product.companyId === auth.user.companyId);
}

export async function updateBaseProduct(request, productId, payload) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DEV, Roles.COMPANY_ADMIN]);

  return mutateDb((state) => {
    const product = findById(state.baseProducts, productId, "Produto base");
    requireCompanyAccess(auth.user, product.companyId);

    Object.assign(product, {
      categoryId: payload.categoryId ?? product.categoryId,
      name: payload.name ?? product.name,
      description: payload.description ?? product.description,
      price: payload.price !== undefined ? toMoney(payload.price) : product.price,
      active: payload.active ?? product.active,
      updatedAt: now()
    });

    state.storeProducts
      .filter((entry) => entry.baseProductId === product.id && entry.pricingMode === "INHERITED")
      .forEach((entry) => {
        entry.price = product.price;
        entry.updatedAt = now();
      });

    return product;
  });
}

export async function deleteBaseProduct(request, productId) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DEV, Roles.COMPANY_ADMIN]);

  return mutateDb((state) => {
    const product = findById(state.baseProducts, productId, "Produto base");
    requireCompanyAccess(auth.user, product.companyId);
    product.active = false;
    product.updatedAt = now();
    return product;
  });
}

export async function createStoreProduct(request, branchId, payload) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DEV, Roles.COMPANY_ADMIN, Roles.BRANCH_MANAGER]);

  return mutateDb((state) => {
    const branch = findById(state.branches, branchId, "Filial");
    requireBranchAccess(auth.user, branch);

    let baseProduct = null;
    if (payload.baseProductId) {
      baseProduct = findById(state.baseProducts, payload.baseProductId, "Produto base");
      requireCompanyAccess(auth.user, baseProduct.companyId);
    }

    const pricingMode = payload.pricingMode || (baseProduct ? "INHERITED" : "EXCLUSIVE");
    const resolvedPrice = pricingMode === "INHERITED" && baseProduct
      ? baseProduct.price
      : toMoney(payload.price || 0);

    const storeProduct = {
      id: crypto.randomUUID(),
      branchId,
      baseProductId: payload.baseProductId || null,
      categoryId: payload.categoryId || baseProduct?.categoryId || null,
      name: payload.name || baseProduct?.name,
      description: payload.description || baseProduct?.description || null,
      price: resolvedPrice,
      pricingMode,
      visible: payload.visible ?? true,
      active: payload.active ?? true,
      createdAt: now(),
      updatedAt: now()
    };

    assert(storeProduct.name, 400, "VALIDATION_ERROR", "Nome do produto da loja é obrigatório.");
    state.storeProducts.push(storeProduct);
    state.stock.push({
      id: crypto.randomUUID(),
      branchId,
      storeProductId: storeProduct.id,
      quantity: Number(payload.initialStock || 0),
      minQuantity: Number(payload.minQuantity || 0),
      updatedAt: now()
    });
    return storeProduct;
  });
}

export async function listStoreProducts(request, branchId) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const branch = findById(db.branches, branchId, "Filial");
  requireBranchAccess(auth.user, branch);
  return filterStoreProductsForBranch(db, branchId);
}

export async function updateStoreProduct(request, storeProductId, payload) {
  const auth = await getAuthContext(request);

  return mutateDb((state) => {
    const storeProduct = findById(state.storeProducts, storeProductId, "Produto da loja");
    const branch = findById(state.branches, storeProduct.branchId, "Filial");
    requireBranchAccess(auth.user, branch);

    const baseProduct = storeProduct.baseProductId
      ? state.baseProducts.find((entry) => entry.id === storeProduct.baseProductId)
      : null;

    storeProduct.categoryId = payload.categoryId ?? storeProduct.categoryId;
    storeProduct.name = payload.name ?? storeProduct.name;
    storeProduct.description = payload.description ?? storeProduct.description;
    storeProduct.pricingMode = payload.pricingMode ?? storeProduct.pricingMode;
    storeProduct.visible = payload.visible ?? storeProduct.visible;
    storeProduct.active = payload.active ?? storeProduct.active;

    if (storeProduct.pricingMode === "INHERITED") {
      assert(baseProduct, 400, "VALIDATION_ERROR", "Produto sem base não pode herdar preço.");
      storeProduct.price = baseProduct.price;
    } else if (payload.price !== undefined) {
      storeProduct.price = toMoney(payload.price);
    }

    storeProduct.updatedAt = now();
    return storeProduct;
  });
}

export async function deleteStoreProduct(request, storeProductId) {
  const auth = await getAuthContext(request);

  return mutateDb((state) => {
    const storeProduct = findById(state.storeProducts, storeProductId, "Produto da loja");
    const branch = findById(state.branches, storeProduct.branchId, "Filial");
    requireBranchAccess(auth.user, branch);
    storeProduct.active = false;
    storeProduct.updatedAt = now();
    return storeProduct;
  });
}

export async function listStock(request, branchId) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const branch = findById(db.branches, branchId, "Filial");
  requireBranchAccess(auth.user, branch);

  return db.stock
    .filter((entry) => entry.branchId === branchId)
    .map((entry) => ({
      ...entry,
      product: db.storeProducts.find((product) => product.id === entry.storeProductId) || null
    }));
}

function registerMovement(state, branchId, storeProductId, quantity, type, reason) {
  state.stockMovements.push({
    id: crypto.randomUUID(),
    branchId,
    storeProductId,
    quantity,
    type,
    reason,
    createdAt: now()
  });
}

export async function stockEntry(request, payload) {
  const auth = await getAuthContext(request);

  return mutateDb((state) => {
    const branch = findById(state.branches, payload.branchId, "Filial");
    requireBranchAccess(auth.user, branch);
    const entry = stockEntryForProduct(state, payload.branchId, payload.storeProductId);
    assert(entry, 404, "NOT_FOUND", "Registro de estoque não encontrado.");
    entry.quantity += Number(payload.quantity || 0);
    entry.minQuantity = payload.minQuantity ?? entry.minQuantity;
    entry.updatedAt = now();
    registerMovement(state, payload.branchId, payload.storeProductId, Number(payload.quantity || 0), "ENTRY", payload.reason || "Entrada manual");
    return entry;
  });
}

export async function stockAdjustment(request, payload) {
  const auth = await getAuthContext(request);

  return mutateDb((state) => {
    const branch = findById(state.branches, payload.branchId, "Filial");
    requireBranchAccess(auth.user, branch);
    const entry = stockEntryForProduct(state, payload.branchId, payload.storeProductId);
    assert(entry, 404, "NOT_FOUND", "Registro de estoque não encontrado.");

    if (payload.mode === "SET") {
      const delta = Number(payload.quantity || 0) - entry.quantity;
      entry.quantity = Number(payload.quantity || 0);
      registerMovement(state, payload.branchId, payload.storeProductId, delta, "ADJUSTMENT", payload.reason || "Ajuste manual");
    } else {
      entry.quantity += Number(payload.quantity || 0);
      registerMovement(state, payload.branchId, payload.storeProductId, Number(payload.quantity || 0), "ADJUSTMENT", payload.reason || "Ajuste manual");
    }

    entry.minQuantity = payload.minQuantity ?? entry.minQuantity;
    entry.updatedAt = now();
    return entry;
  });
}

export async function listStockMovements(request) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const scope = scopedBranchIds(db, auth);
  return db.stockMovements.filter((entry) => scope.includes(entry.branchId));
}

export async function createPublicOrder(payload) {
  assert(payload.slug, 400, "VALIDATION_ERROR", "Slug da loja é obrigatório.");
  assert(Array.isArray(payload.items) && payload.items.length > 0, 400, "VALIDATION_ERROR", "Pedido precisa de itens.");

  return mutateDb((state) => {
    const branch = state.branches.find((entry) => entry.slug === payload.slug && entry.active);
    assert(branch, 404, "NOT_FOUND", "Loja não encontrada.");

    const settings = state.branchSettings.find((entry) => entry.branchId === branch.id);
    assert(settings?.isOpen, 409, "STORE_CLOSED", "Loja indisponível no momento.");

    const items = payload.items.map((item) => {
      const product = state.storeProducts.find((entry) => entry.id === item.storeProductId && entry.branchId === branch.id && entry.active && entry.visible);
      assert(product, 400, "INVALID_PRODUCT", "Produto inválido para a loja.");
      const stock = stockEntryForProduct(state, branch.id, product.id);
      assert(stock, 404, "NOT_FOUND", "Estoque do produto não encontrado.");
      assert(stock.quantity >= Number(item.quantity), 409, "INSUFFICIENT_STOCK", `Estoque insuficiente para ${product.name}.`);

      return {
        product,
        stock,
        quantity: Number(item.quantity),
        unitPrice: toMoney(product.price),
        total: toMoney(Number(item.quantity) * Number(product.price))
      };
    });

    const subtotal = toMoney(items.reduce((sum, item) => sum + item.total, 0));
    const total = toMoney(subtotal + Number(settings.deliveryFee || 0));
    assert(total >= Number(settings.minOrderValue || 0), 409, "MIN_ORDER_VALUE", "Pedido abaixo do valor mínimo da loja.");

    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      branchId: branch.id,
      code: orderId.slice(0, 8).toUpperCase(),
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      deliveryAddress: payload.deliveryAddress,
      notes: payload.notes || null,
      status: "PLACED",
      subtotal,
      deliveryFee: Number(settings.deliveryFee || 0),
      total,
      createdAt: now(),
      updatedAt: now()
    };

    state.orders.push(order);

    items.forEach((item) => {
      state.orderItems.push({
        id: crypto.randomUUID(),
        orderId,
        storeProductId: item.product.id,
        name: item.product.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.total
      });
      item.stock.quantity -= item.quantity;
      item.stock.updatedAt = now();
      registerMovement(state, branch.id, item.product.id, item.quantity * -1, "SALE", `Pedido ${order.code}`);
    });

    return {
      ...order,
      items: state.orderItems.filter((entry) => entry.orderId === orderId)
    };
  });
}

export async function listOrders(request) {
  const auth = await getAuthContext(request);
  const filters = new URL(request.url).searchParams;
  const db = await readDb();
  const scope = scopedBranchIds(db, auth, filters.get("branchId"));
  const status = filters.get("status");

  return db.orders
    .filter((order) => scope.includes(order.branchId))
    .filter((order) => (status ? order.status === status : true))
    .map((order) => ({
      ...order,
      items: db.orderItems.filter((item) => item.orderId === order.id)
    }));
}

export async function getOrder(request, orderId) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const order = findById(db.orders, orderId, "Pedido");
  const branch = findById(db.branches, order.branchId, "Filial");
  requireBranchAccess(auth.user, branch);

  return {
    ...order,
    items: db.orderItems.filter((item) => item.orderId === order.id),
    delivery: db.deliveries.find((delivery) => delivery.orderId === order.id) || null
  };
}

export async function updateOrderStatus(request, orderId, payload) {
  const auth = await getAuthContext(request);
  assert(payload.status, 400, "VALIDATION_ERROR", "Status é obrigatório.");

  return mutateDb((state) => {
    const order = findById(state.orders, orderId, "Pedido");
    const branch = findById(state.branches, order.branchId, "Filial");
    requireBranchAccess(auth.user, branch);
    order.status = payload.status;
    order.updatedAt = now();
    return order;
  });
}

export async function publicOrderTracking(orderId) {
  const db = await readDb();
  const order = findById(db.orders, orderId, "Pedido");
  return {
    id: order.id,
    code: order.code,
    status: order.status,
    updatedAt: order.updatedAt,
    delivery: db.deliveries.find((entry) => entry.orderId === order.id) || null
  };
}

export async function assignDelivery(request, payload) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DEV, Roles.COMPANY_ADMIN, Roles.BRANCH_MANAGER]);
  assert(payload.orderId, 400, "VALIDATION_ERROR", "orderId é obrigatório.");
  assert(payload.deliveryUserId, 400, "VALIDATION_ERROR", "deliveryUserId é obrigatório.");

  return mutateDb((state) => {
    const order = findById(state.orders, payload.orderId, "Pedido");
    const branch = findById(state.branches, order.branchId, "Filial");
    requireBranchAccess(auth.user, branch);

    const user = state.users.find((entry) => entry.id === payload.deliveryUserId && entry.role === Roles.DELIVERY);
    assert(user, 404, "NOT_FOUND", "Entregador não encontrado.");
    assert(user.branchId === branch.id, 409, "INVALID_DELIVERY_USER", "Entregador precisa pertencer à mesma filial.");

    let delivery = state.deliveries.find((entry) => entry.orderId === order.id);
    if (!delivery) {
      delivery = {
        id: crypto.randomUUID(),
        orderId: order.id,
        branchId: branch.id,
        deliveryUserId: user.id,
        status: "ASSIGNED",
        assignedAt: now(),
        updatedAt: now()
      };
      state.deliveries.push(delivery);
    } else {
      delivery.deliveryUserId = user.id;
      delivery.status = "ASSIGNED";
      delivery.updatedAt = now();
    }

    order.status = "OUT_FOR_DELIVERY";
    order.updatedAt = now();
    return delivery;
  });
}

export async function listMyDeliveries(request) {
  const auth = await getAuthContext(request);
  requireRole(auth.user, [Roles.DELIVERY]);
  const db = await readDb();

  return db.deliveries
    .filter((delivery) => delivery.deliveryUserId === auth.user.id)
    .map((delivery) => ({
      ...delivery,
      order: db.orders.find((order) => order.id === delivery.orderId) || null
    }));
}

export async function updateDeliveryStatus(request, deliveryId, payload) {
  const auth = await getAuthContext(request);
  assert(payload.status, 400, "VALIDATION_ERROR", "Status é obrigatório.");

  return mutateDb((state) => {
    const delivery = findById(state.deliveries, deliveryId, "Entrega");
    const branch = findById(state.branches, delivery.branchId, "Filial");

    if (auth.user.role === Roles.DELIVERY) {
      assert(delivery.deliveryUserId === auth.user.id, 403, "FORBIDDEN", "Entrega fora do escopo do entregador.");
    } else {
      requireBranchAccess(auth.user, branch);
    }

    delivery.status = payload.status;
    delivery.updatedAt = now();

    const order = state.orders.find((entry) => entry.id === delivery.orderId);
    if (order) {
      order.status = payload.status === "DELIVERED" ? "DELIVERED" : order.status;
      order.updatedAt = now();
    }

    return delivery;
  });
}

export async function salesSummary(request) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const scope = scopedBranchIds(db, auth, new URL(request.url).searchParams.get("branchId"));
  const orders = db.orders.filter((order) => scope.includes(order.branchId));
  return {
    totalOrders: orders.length,
    grossSales: toMoney(orders.reduce((sum, order) => sum + Number(order.total), 0)),
    averageTicket: orders.length ? toMoney(orders.reduce((sum, order) => sum + Number(order.total), 0) / orders.length) : 0
  };
}

export async function topProducts(request) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const scope = scopedBranchIds(db, auth, new URL(request.url).searchParams.get("branchId"));
  const orders = db.orders.filter((order) => scope.includes(order.branchId)).map((order) => order.id);
  const counters = new Map();

  db.orderItems
    .filter((item) => orders.includes(item.orderId))
    .forEach((item) => {
      const current = counters.get(item.storeProductId) || {
        storeProductId: item.storeProductId,
        name: item.name,
        quantity: 0,
        revenue: 0
      };
      current.quantity += item.quantity;
      current.revenue = toMoney(current.revenue + Number(item.total));
      counters.set(item.storeProductId, current);
    });

  return Array.from(counters.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
}

export async function lowStock(request) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const scope = scopedBranchIds(db, auth, new URL(request.url).searchParams.get("branchId"));
  return db.stock
    .filter((entry) => scope.includes(entry.branchId))
    .filter((entry) => entry.quantity <= entry.minQuantity)
    .map((entry) => ({
      ...entry,
      product: db.storeProducts.find((product) => product.id === entry.storeProductId) || null
    }));
}

export async function getBranchSettings(request, branchId) {
  const auth = await getAuthContext(request);
  const db = await readDb();
  const branch = findById(db.branches, branchId, "Filial");
  requireBranchAccess(auth.user, branch);
  return db.branchSettings.find((entry) => entry.branchId === branchId) || null;
}

export async function updateBranchSettings(request, branchId, payload) {
  const auth = await getAuthContext(request);

  return mutateDb((state) => {
    const branch = findById(state.branches, branchId, "Filial");
    requireBranchAccess(auth.user, branch);

    let settings = state.branchSettings.find((entry) => entry.branchId === branchId);
    if (!settings) {
      settings = {
        branchId,
        isOpen: true,
        minOrderValue: 0,
        deliveryFee: 0,
        allowPickup: true,
        updatedAt: now()
      };
      state.branchSettings.push(settings);
    }

    Object.assign(settings, {
      isOpen: payload.isOpen ?? settings.isOpen,
      minOrderValue: payload.minOrderValue ?? settings.minOrderValue,
      deliveryFee: payload.deliveryFee ?? settings.deliveryFee,
      allowPickup: payload.allowPickup ?? settings.allowPickup,
      updatedAt: now()
    });
    return settings;
  });
}
