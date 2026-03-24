import { ok, withHandler } from "@/lib/api";
import { getPublicStoreProducts } from "@/lib/domain";

export const GET = withHandler(async (_, { params }) => {
  const data = await getPublicStoreProducts(params.slug);
  return ok(data);
});
