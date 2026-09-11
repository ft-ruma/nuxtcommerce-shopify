// server/utils/collections.ts
import { getCategoriesQuery } from '~/gql/queries/getCategories';
import { getShopifyConfig, shopifyRequest } from '~~/server/utils/shopify';
import { mapCollection, slugify } from '~~/server/utils/shopifyMappers';

/** All visible collections that have at least one product in stock. Cached for an hour. */
export const getShopifyCollections = defineCachedFunction(
  async () => {
    const { country, hiddenCollections } = getShopifyConfig();
    const data = await shopifyRequest<any>(getCategoriesQuery, { country });
    return (data.collections?.nodes ?? [])
      .filter((c: any) => !hiddenCollections.includes(String(c.handle).toLowerCase()))
      .filter((c: any) => c.products?.nodes?.length)
      .map(mapCollection);
  },
  { name: 'shopify-collections', maxAge: 60 * 60, swr: true, getKey: () => 'all' }
);

export async function findCollectionByName(name: string) {
  const needle = name.trim().toLowerCase();
  const collections = await getShopifyCollections();
  return collections.find((c: any) => c.name.toLowerCase() === needle || c.handle === needle || c.handle === slugify(name));
}
