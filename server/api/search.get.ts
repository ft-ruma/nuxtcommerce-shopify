// server/api/search.get.ts
import { getSearchProductsQuery } from '~/gql/queries/getSearchProducts';
import { getShopifyConfig, shopifyRequest } from '~~/server/utils/shopify';
import { mapProductCard } from '~~/server/utils/shopifyMappers';
import { buildProductQuery } from '~~/server/utils/search';
import { filterMockProducts, toMockProductCard } from '~~/server/utils/mockProducts';

export default cachedEventHandler(
  async event => {
    const { search = '' } = getQuery(event) as { search?: string };
    const term = search.trim();
    const mocks = filterMockProducts({ term }).map(toMockProductCard);

    try {
      const { country } = getShopifyConfig();
      const data = await shopifyRequest<any>(getSearchProductsQuery, {
        query: buildProductQuery(term),
        sortKey: term ? 'RELEVANCE' : 'CREATED_AT',
        reverse: !term,
        country,
      });
      return { products: { nodes: [...mocks, ...data.products.nodes.map(mapProductCard)] } };
    } catch {
      return { products: { nodes: mocks } };
    }
  },
  {
    maxAge: 60,
    swr: true,
    getKey: event => event.req.url!,
  }
);
