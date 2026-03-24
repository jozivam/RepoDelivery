import { ok, readJson, requireFields, withHandler } from "@/lib/api";
import { stockAdjustment } from "@/lib/domain";

export const POST = withHandler(async (request) => {
  const payload = await readJson(request);
  requireFields(payload, ["branchId", "storeProductId", "quantity"]);
  const data = await stockAdjustment(request, payload);
  return ok(data, 201);
});
