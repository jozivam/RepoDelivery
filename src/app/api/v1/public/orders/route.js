import { ok, readJson, requireFields, withHandler } from "@/lib/api";
import { createPublicOrder } from "@/lib/domain";

export const POST = withHandler(async (request) => {
  const payload = await readJson(request);
  requireFields(payload, ["slug", "customerName", "customerPhone", "deliveryAddress"]);
  const data = await createPublicOrder(payload);
  return ok(data, 201);
});
