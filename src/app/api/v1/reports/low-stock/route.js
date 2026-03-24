import { ok, withHandler } from "@/lib/api";
import { lowStock } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await lowStock(request);
  return ok(data);
});
