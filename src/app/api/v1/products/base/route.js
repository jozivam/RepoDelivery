import { ok, readJson, withHandler } from "@/lib/api";
import { createBaseProduct, listBaseProducts } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await listBaseProducts(request);
  return ok(data);
});

export const POST = withHandler(async (request) => {
  const payload = await readJson(request);
  const data = await createBaseProduct(request, payload);
  return ok(data, 201);
});
