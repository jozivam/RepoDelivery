import { ok, withHandler } from "@/lib/api";
import { getPublicStoreCategories } from "@/lib/domain";

export const GET = withHandler(async (_, { params }) => {
  const data = await getPublicStoreCategories(params.slug);
  return ok(data);
});
