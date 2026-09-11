// server/api/search.get.ts
import { getSearchProductsQuery } from '~/gql/queries/getSearchProducts';
import { getShopifyConfig, shopifyRequest } from '~~/server/utils/shopify';
import { mapProductCard } from '~~/server/utils/shopifyMappers';
import { buildProductQuery } from '~~/server/utils/search';

export default cachedEventHandler(
  async event => {
    const { search = '' } = getQuery(event) as { search?: string };
    const { country } = getShopifyConfig();
    const term = search.trim();

    // Empty search shows "New products", same as before.
    const data = await shopifyRequest<any>(getSearchProductsQuery, {
      query: buildProductQuery(term),
      sortKey: term ? 'RELEVANCE' : 'CREATED_AT',
      reverse: !term,
      country,
    });

    return { products: { nodes: data.products.nodes.map(mapProductCard) } };
  },
  {
    maxAge: 60,
    swr: true,
    getKey: event => event.req.url!,
  }
);
