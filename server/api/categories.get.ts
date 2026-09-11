// server/api/categories.get.ts
import { getShopifyCollections } from '~~/server/utils/collections';

export default cachedEventHandler(
  async () => {
    return { productCategories: { nodes: await getShopifyCollections() } };
  },
  {
    maxAge: 60 * 60,
    swr: true,
  }
);
