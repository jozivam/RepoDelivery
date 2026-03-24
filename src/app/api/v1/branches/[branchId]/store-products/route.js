import { ok, readJson, withHandler } from "@/lib/api";
import { createStoreProduct, listStoreProducts } from "@/lib/domain";

export const GET = withHandler(async (request, { params }) => {
  const data = await listStoreProducts(request, params.branchId);
  return ok(data);
});

export const POST = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  const data = await createStoreProduct(request, params.branchId, payload);
  return ok(data, 201);
});
