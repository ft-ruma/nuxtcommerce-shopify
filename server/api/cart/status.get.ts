// server/api/cart/status.get.ts
// Lets the storefront know whether a checkout was completed (Shopify returns null for completed carts).
import { getCartQuery } from '~/gql/queries/getCart';
import { shopifyRequest } from '~~/server/utils/shopify';

export default defineEventHandler(async event => {
  const { id = '' } = getQuery(event) as { id?: string };
  if (!id.startsWith('gid://shopify/Cart/')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid cart id' });
  }
  const data = await shopifyRequest<any>(getCartQuery, { id }, event);
  return { completed: !data.cart };
});
