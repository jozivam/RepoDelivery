import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ApiError } from "@/lib/api";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "db.json");

let writeQueue = Promise.resolve();

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function seedData() {
  const companyId = id();
  const branchId = id();
  const devUserId = id();
  const companyAdminId = id();
  const branchManagerId = id();
  const deliveryId = id();
  const beverageCategoryId = id();
  const snackCategoryId = id();
  const baseProduct1Id = id();
  const baseProduct2Id = id();
  const storeProduct1Id = id();
  const storeProduct2Id = id();
  const stock1Id = id();
  const stock2Id = id();

  return {
    companies: [
      {
        id: companyId,
        name: "Acme Delivery Group",
        document: "12.345.678/0001-90",
        active: true,
        createdAt: now(),
        updatedAt: now()
      }
    ],
    branches: [
      {
        id: branchId,
        companyId,
        name: "Loja Centro",
        slug: "loja-centro",
        address: "Rua Central, 100",
        active: true,
        createdAt: now(),
        updatedAt: now()
      }
    ],
    users: [
      {
        id: devUserId,
        name: "Dev Root",
        email: "dev@repodelivery.local",
        password: "dev123456",
        role: "DEV",
        companyId: null,
        branchId: null,
        active: true
      },
      {
        id: companyAdminId,
        name: "Owner Acme",
        email: "owner@acme.local",
        password: "owner123",
        role: "COMPANY_ADMIN",
        companyId,
        branchId: null,
        active: true
      },
      {
        id: branchManagerId,
        name: "Manager Centro",
        email: "manager@centro.local",
        password: "manager123",
        role: "BRANCH_MANAGER",
        companyId,
        branchId,
        active: true
      },
      {
        id: deliveryId,
        name: "Rider Centro",
        email: "rider@centro.local",
        password: "delivery123",
        role: "DELIVERY",
        companyId,
        branchId,
        active: true
      }
    ],
    categories: [
      {
        id: beverageCategoryId,
        companyId,
        name: "Bebidas",
        slug: "bebidas",
        active: true
      },
      {
        id: snackCategoryId,
        companyId,
        name: "Lanches",
        slug: "lanches",
        active: true
      }
    ],
    baseProducts: [
      {
        id: baseProduct1Id,
        companyId,
        categoryId: beverageCategoryId,
        name: "Suco Natural 500ml",
        description: "Suco gelado da casa",
        price: 12.5,
        active: true,
        createdAt: now(),
        updatedAt: now()
      },
      {
        id: baseProduct2Id,
        companyId,
        categoryId: snackCategoryId,
        name: "Sanduiche Clássico",
        description: "Pão, queijo e presunto",
        price: 19.9,
        active: true,
        createdAt: now(),
        updatedAt: now()
      }
    ],
    storeProducts: [
      {
        id: storeProduct1Id,
        branchId,
        baseProductId: baseProduct1Id,
        categoryId: beverageCategoryId,
        name: "Suco Natural 500ml",
        description: "Suco gelado da casa",
        price: 12.5,
        pricingMode: "INHERITED",
        visible: true,
        active: true,
        createdAt: now(),
        updatedAt: now()
      },
      {
        id: storeProduct2Id,
        branchId,
        baseProductId: baseProduct2Id,
        categoryId: snackCategoryId,
        name: "Sanduiche Clássico",
        description: "Pão, queijo e presunto",
        price: 21.9,
        pricingMode: "OVERRIDE",
        visible: true,
        active: true,
        createdAt: now(),
        updatedAt: now()
      }
    ],
    stock: [
      {
        id: stock1Id,
        branchId,
        storeProductId: storeProduct1Id,
        quantity: 30,
        minQuantity: 5,
        updatedAt: now()
      },
      {
        id: stock2Id,
        branchId,
        storeProductId: storeProduct2Id,
        quantity: 15,
        minQuantity: 4,
        updatedAt: now()
      }
    ],
    stockMovements: [],
    orders: [],
    orderItems: [],
    deliveries: [],
    branchSettings: [
      {
        branchId,
        isOpen: true,
        minOrderValue: 20,
        deliveryFee: 6,
        allowPickup: true,
        updatedAt: now()
      }
    ],
    sessions: []
  };
}

async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    const initialData = process.env.NODE_ENV === "production"
      ? {
          companies: [],
          branches: [],
          users: [],
          categories: [],
          baseProducts: [],
          storeProducts: [],
          stock: [],
          stockMovements: [],
          orders: [],
          orderItems: [],
          deliveries: [],
          branchSettings: [],
          sessions: []
        }
      : seedData();

    await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2));
  }
}

export async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(nextDb) {
  await ensureDb();
  writeQueue = writeQueue.then(() => fs.writeFile(dbPath, JSON.stringify(nextDb, null, 2)));
  await writeQueue;
  return nextDb;
}

export async function mutateDb(mutator) {
  const current = await readDb();
  const clone = structuredClone(current);
  const result = await mutator(clone);
  await writeDb(clone);
  return result;
}

export function findById(collection, entityId, label = "registro") {
  const item = collection.find((entry) => entry.id === entityId);
  if (!item) {
    throw new ApiError(404, "NOT_FOUND", `${label} não encontrado.`);
  }
  return item;
}
