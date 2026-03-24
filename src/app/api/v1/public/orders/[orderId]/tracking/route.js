import { ok, withHandler } from "@/lib/api";
import { publicOrderTracking } from "@/lib/domain";

export const GET = withHandler(async (_, { params }) => {
  const data = await publicOrderTracking(params.orderId);
  return ok(data);
});
