import { ok, withHandler } from "@/lib/api";
import { listStock } from "@/lib/domain";

export const GET = withHandler(async (request, { params }) => {
  const data = await listStock(request, params.branchId);
  return ok(data);
});
