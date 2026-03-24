import { ok, withHandler } from "@/lib/api";
import { getPublicStore } from "@/lib/domain";

export const GET = withHandler(async (_, { params }) => {
  const data = await getPublicStore(params.slug);
  return ok(data);
});
