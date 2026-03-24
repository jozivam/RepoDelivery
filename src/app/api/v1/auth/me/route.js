import { ok, withHandler } from "@/lib/api";
import { getMe } from "@/lib/domain";

export const GET = withHandler(async (request) => {
  const data = await getMe(request);
  return ok(data);
});
