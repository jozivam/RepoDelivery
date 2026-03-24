import { ok, readJson, withHandler } from "@/lib/api";
import { getBranchSettings, updateBranchSettings } from "@/lib/domain";

export const GET = withHandler(async (request, { params }) => {
  const data = await getBranchSettings(request, params.branchId);
  return ok(data);
});

export const PATCH = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  const data = await updateBranchSettings(request, params.branchId, payload);
  return ok(data);
});
