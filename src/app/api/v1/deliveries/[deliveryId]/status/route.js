import { ok, readJson, requireFields, withHandler } from "@/lib/api";
import { updateDeliveryStatus } from "@/lib/domain";

export const PATCH = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  requireFields(payload, ["status"]);
  const data = await updateDeliveryStatus(request, params.deliveryId, payload);
  return ok(data);
});
