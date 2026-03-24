import { ok, readJson, withHandler } from "@/lib/api";
import { createBranch, listCompanyBranches } from "@/lib/domain";

export const GET = withHandler(async (request, { params }) => {
  const data = await listCompanyBranches(request, params.companyId);
  return ok(data);
});

export const POST = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  const data = await createBranch(request, params.companyId, payload);
  return ok(data, 201);
});
