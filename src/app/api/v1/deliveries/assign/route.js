import { ok, readJson, requireFields, withHandler } from "@/lib/api";
import { assignDelivery } from "@/lib/domain";

export const POST = withHandler(async (request) => {
  const payload = await readJson(request);
  requireFields(payload, ["orderId", "deliveryUserId"]);
  const data = await assignDelivery(request, payload);
  return ok(data, 201);
});
