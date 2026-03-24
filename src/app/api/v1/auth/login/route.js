import { login } from "@/lib/auth";
import { ok, readJson, requireFields, withHandler } from "@/lib/api";

export const POST = withHandler(async (request) => {
  const payload = await readJson(request);
  requireFields(payload, ["email", "password"]);
  const data = await login(payload.email, payload.password);
  return ok(data);
});
