import { ok, readJson, withHandler } from "@/lib/api";
import { getBranch, updateBranch } from "@/lib/domain";

export const GET = withHandler(async (request, { params }) => {
  const data = await getBranch(request, params.branchId);
  return ok(data);
});

export const PATCH = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  const data = await updateBranch(request, params.branchId, payload);
  return ok(data);
});
