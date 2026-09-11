// server/api/product.get.ts
import { getProductQuery, getProductRecommendationsQuery } from '~/gql/queries/getProduct';
import { getShopifyConfig, shopifyRequest, shopifyRequestWithInventory } from '~~/server/utils/shopify';
import { mapProductDetail, toGid } from '~~/server/utils/shopifyMappers';

// URL format: /product/{handle}-{productId} or /product/{handle}-{colour}-{productId}
// The page splits the last segment off as `sku`, which is the numeric Shopify product ID.
export default cachedEventHandler(
  async event => {
    const { slug = '', sku = '' } = getQuery(event) as { slug?: string; sku?: string };
    const { country } = getShopifyConfig();

    let product: any = null;
    if (/^\d+$/.test(sku)) {
      product = (await shopifyRequestWithInventory<any>(getProductQuery, { id: toGid('Product', sku), country })).product;
    }
    if (!product && slug) {
      // Fallback for links that carry a handle only.
      product = (await shopifyRequestWithInventory<any>(getProductQuery, { handle: slug, country })).product;
    }
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' });
    }

    const colorSlug = slug.startsWith(`${product.handle}-`) ? slug.slice(product.handle.length + 1) : '';

    const related = await shopifyRequest<any>(getProductRecommendationsQuery, { productId: product.id, country })
      .then(data => data.productRecommendations ?? [])
      .catch(() => []);

    return { product: mapProductDetail(product, colorSlug, related) };
  },
  {
    maxAge: 60 * 5,
    swr: true,
    getKey: event => event.req.url!,
  }
);
