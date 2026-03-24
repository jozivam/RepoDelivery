import { ok, withHandler } from "@/lib/api";
import { listStockMovements } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await listStockMovements(request);
  return ok(data);
});
