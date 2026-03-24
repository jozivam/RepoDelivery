import { ok, withHandler } from "@/lib/api";
import { changeBranchContext } from "@/lib/domain";

export const GET = withHandler(async (request, { params }) => {
  const data = await changeBranchContext(request, params.branchId);
  return ok(data);
});
