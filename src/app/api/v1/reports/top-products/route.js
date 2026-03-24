import { ok, withHandler } from "@/lib/api";
import { topProducts } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await topProducts(request);
  return ok(data);
});
