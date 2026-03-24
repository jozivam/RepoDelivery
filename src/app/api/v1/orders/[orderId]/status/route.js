import { ok, readJson, requireFields, withHandler } from "@/lib/api";
import { updateOrderStatus } from "@/lib/domain";

export const PATCH = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  requireFields(payload, ["status"]);
  const data = await updateOrderStatus(request, params.orderId, payload);
  return ok(data);
});
