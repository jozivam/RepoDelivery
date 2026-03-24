import { ok, withHandler } from "@/lib/api";
import { salesSummary } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await salesSummary(request);
  return ok(data);
});
