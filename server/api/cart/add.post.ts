// server/api/cart/add.post.ts
// Validates the variant and stock against Shopify and returns a cart line for the local cart.
// The real Shopify cart is created at checkout from the local cart (see checkout.post.ts).
import { getVariantQuery } from '~/gql/queries/getVariant';
import { getShopifyConfig, shopifyRequestWithInventory } from '~~/server/utils/shopify';
import { mapCartItem, stockLimit, toGid } from '~~/server/utils/shopifyMappers';

export default defineEventHandler(async event => {
  const body = await readBody<{ productId?: number | string; quantity?: number }>(event);
  const variantId = String(body?.productId ?? '');
  const quantity = Math.max(1, Math.floor(Number(body?.quantity) || 1));

  if (!/^\d+$/.test(variantId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product' });
  }

  const { country } = getShopifyConfig();
  const data = await shopifyRequestWithInventory<any>(getVariantQuery, { id: toGid('ProductVariant', variantId), country }, event);
  const variant = data.node;

  if (!variant?.id || !variant.availableForSale) {
    throw createError({ statusCode: 409, statusMessage: 'Insufficient stock' });
  }

  const limit = stockLimit(variant);
  if (limit !== null && quantity > limit) {
    throw createError({ statusCode: 409, statusMessage: 'Insufficient stock' });
  }

  return { addToCart: { cartItem: mapCartItem(variant, quantity) } };
});
