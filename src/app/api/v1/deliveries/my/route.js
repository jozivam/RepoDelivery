import { ok, withHandler } from "@/lib/api";
import { listMyDeliveries } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await listMyDeliveries(request);
  return ok(data);
});
