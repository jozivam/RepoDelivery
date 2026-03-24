import { ok, readJson, withHandler } from "@/lib/api";
import { getCompany, updateCompany } from "@/lib/domain";

export const GET = withHandler(async (request, { params }) => {
  const data = await getCompany(request, params.companyId);
  return ok(data);
});

export const PATCH = withHandler(async (request, { params }) => {
  const payload = await readJson(request);
  const data = await updateCompany(request, params.companyId, payload);
  return ok(data);
});
