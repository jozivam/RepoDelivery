import { ok, withHandler } from "@/lib/api";
import { logoutCurrentSession } from "@/lib/domain";

export const POST = withHandler(async (request) => {
  const data = await logoutCurrentSession(request);
  return ok(data);
});
