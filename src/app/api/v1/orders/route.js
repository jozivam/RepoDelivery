import { ok, withHandler } from "@/lib/api";
import { listOrders } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await listOrders(request);
  return ok(data);
});
