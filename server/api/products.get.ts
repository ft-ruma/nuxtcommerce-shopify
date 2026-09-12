// server/api/products.get.ts
import { getProductsQuery, getCollectionProductsQuery, getCollectionProductsPlainQuery } from '~/gql/queries/getProducts';
import { getShopifyConfig, shopifyRequest } from '~~/server/utils/shopify';
import { mapProductCard } from '~~/server/utils/shopifyMappers';
import { findCollectionByName } from '~~/server/utils/collections';
import { buildProductQuery, matchesTerm } from '~~/server/utils/search';
import { matchesCatalogFilters, parseCatalogFilters, toShopifyProductFilters } from '~~/server/utils/catalogFilters';
import { filterMockProducts, toMockProductCard } from '~~/server/utils/mockProducts';

const PAGE_SIZE = 21;

async function collectionProducts(handle: string, variables: Record<string, any>, shopifyFilters: any[]) {
  try {
    return await shopifyRequest<any>(getCollectionProductsQuery, { ...variables, handle, filters: shopifyFilters });
  } catch {
    return shopifyRequest<any>(getCollectionProductsPlainQuery, { ...variables, handle });
  }
}

function mockCards(query: Record<string, string | undefined>, term?: string) {
  const filters = parseCatalogFilters(query);
  return filterMockProducts({
    term,
    size: filters.size,
    availability: filters.availability,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  }).map(toMockProductCard);
}

export default cachedEventHandler(
  async event => {
    const query = getQuery(event) as Record<string, string | undefined>;
    const { after, search, category, order = 'DESC', field = 'DATE' } = query;
    const filters = parseCatalogFilters(query);
    const { country } = getShopifyConfig();
    const reverse = order.toUpperCase() !== 'ASC';
    const byPrice = field.toUpperCase() === 'PRICE';
    const term = search?.trim();
    const shopifyFilters = toShopifyProductFilters(filters);
    const mocks = after ? [] : mockCards(query, term);

    if (category) {
      try {
        const collection = await findCollectionByName(category);
        if (!collection) return { products: { nodes: mocks, pageInfo: { hasNextPage: false, endCursor: null } } };

        const nodes: any[] = [];
        let cursor: string | null = after || null;
        let pageInfo = { hasNextPage: false, endCursor: null as string | null };

        for (let i = 0; i < 5; i++) {
          const data = await collectionProducts(
            collection.handle,
            {
              first: PAGE_SIZE,
              after: cursor,
              sortKey: byPrice ? 'PRICE' : 'CREATED',
              reverse,
              country,
            },
            shopifyFilters
          );
          const connection = data.collection?.products;
          if (!connection) break;

          nodes.push(
            ...connection.nodes.filter((p: any) => {
              if (term && !matchesTerm(p, term)) return false;
              return matchesCatalogFilters(p, filters);
            })
          );
          pageInfo = connection.pageInfo;
          cursor = pageInfo.endCursor;
          if (nodes.length >= PAGE_SIZE || !pageInfo.hasNextPage) break;
        }

        return { products: { nodes: [...mocks, ...nodes.slice(0, PAGE_SIZE).map(mapProductCard)], pageInfo } };
      } catch {
        return { products: { nodes: mocks, pageInfo: { hasNextPage: false, endCursor: null } } };
      }
    }

    try {
      const nodes: any[] = [];
      let cursor: string | null = after || null;
      let pageInfo = { hasNextPage: false, endCursor: null as string | null };

      for (let i = 0; i < 5; i++) {
        const data = await shopifyRequest<any>(getProductsQuery, {
          first: PAGE_SIZE,
          after: cursor,
          query: buildProductQuery(term, { ...filters, size: undefined, sizeOption: undefined }),
          sortKey: byPrice ? 'PRICE' : 'CREATED_AT',
          reverse,
          country,
        });
        const connection = data.products;
        if (!connection) break;
        nodes.push(...connection.nodes.filter((p: any) => matchesCatalogFilters(p, filters)));
        pageInfo = connection.pageInfo;
        cursor = pageInfo.endCursor;
        if (nodes.length >= PAGE_SIZE || !pageInfo.hasNextPage) break;
      }

      return {
        products: {
          nodes: [...mocks, ...nodes.slice(0, PAGE_SIZE).map(mapProductCard)],
          pageInfo,
        },
      };
    } catch {
      return { products: { nodes: mocks, pageInfo: { hasNextPage: false, endCursor: null } } };
    }
  },
  {
    maxAge: 60,
    swr: true,
    getKey: event => event.req.url!,
  }
);
