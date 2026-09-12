import { getCollectionFiltersQuery, getSearchFiltersQuery } from '~/gql/queries/getFilters';
import { getCollectionProductsPlainQuery, getProductsQuery } from '~/gql/queries/getProducts';
import { getShopifyConfig, shopifyRequest } from '~~/server/utils/shopify';
import { findCollectionByName } from '~~/server/utils/collections';
import { buildProductQuery } from '~~/server/utils/search';
import { mockFilterPayload } from '~~/server/utils/mockProducts';
import {
  aggregateFromProducts,
  currencyPrefix,
  mapShopifyFilters,
  parseCatalogFilters,
  toShopifyProductFilters,
  type CatalogFilterPayload,
} from '~~/server/utils/catalogFilters';

function withPrefix(payload: CatalogFilterPayload): CatalogFilterPayload {
  return {
    ...payload,
    price: {
      ...payload.price,
      prefix: currencyPrefix(payload.price.currency),
    },
  };
}

export default cachedEventHandler(
  async event => {
    const query = getQuery(event) as Record<string, string | undefined>;
    const filters = parseCatalogFilters(query);
    const { country } = getShopifyConfig();
    const shopifyFilters = toShopifyProductFilters({ ...filters, size: undefined, sizeOption: undefined });
    const term = typeof query.search === 'string' ? query.search.trim() : '';

    if (query.category) {
      try {
        const collection = await findCollectionByName(query.category);
        if (!collection) return mockFilterPayload();

        try {
          const data = await shopifyRequest<any>(getCollectionFiltersQuery, {
            handle: collection.handle,
            filters: shopifyFilters,
            country,
          });
          const mapped = mapShopifyFilters(data.collection?.products?.filters ?? []);
          if (mapped.sizes.length || mapped.price.max) return withPrefix(mapped);
        } catch {
          // Storefront filtering may be disabled; fall through to a product scan.
        }

        const data = await shopifyRequest<any>(getCollectionProductsPlainQuery, {
          handle: collection.handle,
          first: 250,
          after: null,
          sortKey: 'CREATED',
          reverse: true,
          country,
        });
        return withPrefix(aggregateFromProducts(data.collection?.products?.nodes ?? []));
      } catch {
        return mockFilterPayload();
      }
    }

    try {
      const data = await shopifyRequest<any>(getSearchFiltersQuery, {
        query: term || '*',
        productFilters: shopifyFilters,
        country,
      });
      const mapped = mapShopifyFilters(data.search?.productFilters ?? []);
      if (mapped.sizes.length || mapped.availability.some(v => v.count)) return withPrefix(mapped);
    } catch {
      // Search aggregations are not available on every API version/token.
    }

    try {
      const data = await shopifyRequest<any>(getProductsQuery, {
        first: 250,
        after: null,
        query: buildProductQuery(term, { availability: 'all' }),
        sortKey: 'CREATED_AT',
        reverse: true,
        country,
      });
      return withPrefix(aggregateFromProducts(data.products?.nodes ?? []));
    } catch {
      return mockFilterPayload();
    }
  },
  {
    maxAge: 60,
    swr: true,
    getKey: event => event.req.url!,
  }
);
