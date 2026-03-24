import { ok, withHandler } from "@/lib/api";
import { getOrder } from "@/lib/domain";

export const GET = withHandler(async (request, { params }) => {
  const data = await getOrder(request, params.orderId);
  return ok(data);
});
