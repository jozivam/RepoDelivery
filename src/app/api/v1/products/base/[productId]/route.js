import { ok, readJson, withHandler } from "@/lib/api";
import { deleteBaseProduct, updateBaseProduct } from "@/lib/domain";

export const PATCH = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  const data = await updateBaseProduct(request, params.productId, payload);
  return ok(data);
});

export const DELETE = withHandler(async (request, { params }) => {
  const data = await deleteBaseProduct(request, params.productId);
  return ok(data);
});
