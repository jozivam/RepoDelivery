import { ok, readJson, withHandler } from "@/lib/api";
import { createCompany, listCompanies } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await listCompanies(request);
  return ok(data);
});

export const POST = withHandler(async (request) => {
  const payload = await readJson(request);
  const data = await createCompany(request, payload);
  return ok(data, 201);
});
