import { ok, readJson, withHandler } from "@/lib/api";
import { deleteStoreProduct, updateStoreProduct } from "@/lib/domain";

export const PATCH = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  const data = await updateStoreProduct(request, params.storeProductId, payload);
  return ok(data);
});

export const DELETE = withHandler(async (request, { params }) => {
  const data = await deleteStoreProduct(request, params.storeProductId);
  return ok(data);
});
