// server/api/products.get.ts
import { getProductsQuery, getCollectionProductsQuery } from '~/gql/queries/getProducts';
import { getShopifyConfig, shopifyRequest } from '~~/server/utils/shopify';
import { mapProductCard } from '~~/server/utils/shopifyMappers';
import { findCollectionByName } from '~~/server/utils/collections';
import { buildProductQuery, matchesTerm } from '~~/server/utils/search';

const PAGE_SIZE = 21;
const emptyPage = { products: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } };

export default cachedEventHandler(
  async event => {
    const { after, search, category, order = 'DESC', field = 'DATE' } = getQuery(event) as Record<string, string | undefined>;
    const { country } = getShopifyConfig();
    const reverse = order.toUpperCase() !== 'ASC';
    const byPrice = field.toUpperCase() === 'PRICE';
    const term = search?.trim();

    if (category) {
      const collection = await findCollectionByName(category);
      if (!collection) return emptyPage;

      // Collections can't be text-searched, so when a search term is active we filter
      // locally and keep paging until the page is full (max 5 requests).
      const nodes: any[] = [];
      let cursor: string | null = after || null;
      let pageInfo = { hasNextPage: false, endCursor: null as string | null };

      for (let i = 0; i < 5; i++) {
        const data = await shopifyRequest<any>(getCollectionProductsQuery, {
          handle: collection.handle,
          first: PAGE_SIZE,
          after: cursor,
          sortKey: byPrice ? 'PRICE' : 'CREATED',
          reverse,
          country,
        });
        const connection = data.collection?.products;
        if (!connection) break;

        nodes.push(...(term ? connection.nodes.filter((p: any) => matchesTerm(p, term)) : connection.nodes));
        pageInfo = connection.pageInfo;
        cursor = pageInfo.endCursor;
        if (!term || nodes.length >= PAGE_SIZE || !pageInfo.hasNextPage) break;
      }

      return { products: { nodes: nodes.map(mapProductCard), pageInfo } };
    }

    const data = await shopifyRequest<any>(getProductsQuery, {
      first: PAGE_SIZE,
      after: after || null,
      query: buildProductQuery(term),
      sortKey: byPrice ? 'PRICE' : 'CREATED_AT',
      reverse,
      country,
    });

    return {
      products: {
        nodes: data.products.nodes.map(mapProductCard),
        pageInfo: data.products.pageInfo,
      },
    };
  },
  {
    maxAge: 60,
    swr: true,
    getKey: event => event.req.url!,
  }
);
