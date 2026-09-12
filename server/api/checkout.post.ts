// server/api/checkout.post.ts
// Shopify only processes payments on its own hosted checkout, so we create a cart with
// the shopper's form details prefilled and hand back the checkoutUrl to redirect to.
import { checkoutMutation } from '~/gql/mutations/checkout';
import { getShopifyConfig, shopifyRequest } from '~~/server/utils/shopify';
import { toGid } from '~~/server/utils/shopifyMappers';
import { isMockVariantId } from '~~/server/utils/mockProducts';

type Body = {
  billing?: Partial<Record<'email' | 'firstName' | 'lastName' | 'phone' | 'city' | 'address1', string>>;
  lines?: Array<{ merchandiseId: number | string; quantity: number }>;
  locale?: string;
};

const LANGUAGES: Record<string, string> = { en: 'EN', nb: 'NB', nl: 'NL', de: 'DE' };

// Shopify requires E.164 phone numbers (+94771234567). Anything else is left for the checkout page.
const toE164 = (phone?: string) => {
  const cleaned = (phone ?? '').replace(/[\s\-().]/g, '');
  return /^\+[1-9]\d{6,14}$/.test(cleaned) ? cleaned : undefined;
};

const clean = (value?: string) => value?.trim() || undefined;

export default defineEventHandler(async event => {
  const { billing = {}, lines = [], locale } = (await readBody<Body>(event)) ?? {};
  const { country } = getShopifyConfig();

  const cartLines = lines
    .filter(line => /^\d+$/.test(String(line?.merchandiseId)) && Number(line.quantity) > 0)
    .map(line => ({
      merchandiseId: String(line.merchandiseId),
      quantity: Math.floor(Number(line.quantity)),
    }));

  if (!cartLines.length) {
    throw createError({ statusCode: 400, statusMessage: 'Your cart is empty' });
  }

  const mockCheckout = () => ({
    mock: true,
    cartId: `mock-${Date.now()}`,
    orderNumber: `BGD${Date.now().toString().slice(-8)}`,
  });

  if (cartLines.some(line => isMockVariantId(line.merchandiseId))) {
    return mockCheckout();
  }

  const shopifyLines = cartLines.map(line => ({
    merchandiseId: toGid('ProductVariant', line.merchandiseId),
    quantity: line.quantity,
  }));

  const baseInput: Record<string, any> = {
    lines: shopifyLines,
    buyerIdentity: {
      email: clean(billing.email),
      countryCode: country,
    },
  };

  // A delivery address needs a country, so it's only prefilled when SHOPIFY_COUNTRY_CODE is set.
  const inputWithAddress = country
    ? {
        ...baseInput,
        delivery: {
          addresses: [
            {
              selected: true,
              oneTimeUse: true,
              address: {
                deliveryAddress: {
                  firstName: clean(billing.firstName),
                  lastName: clean(billing.lastName),
                  address1: clean(billing.address1),
                  city: clean(billing.city),
                  phone: toE164(billing.phone),
                  countryCode: country,
                },
              },
            },
          ],
        },
      }
    : baseInput;

  const variables = { country, language: LANGUAGES[String(locale)] };

  try {
    let result = (await shopifyRequest<any>(checkoutMutation, { ...variables, input: inputWithAddress }, event)).cartCreate;

    if (!result?.cart) {
      result = (await shopifyRequest<any>(checkoutMutation, { ...variables, input: { lines: shopifyLines } }, event)).cartCreate;
    }

    if (!result?.cart?.checkoutUrl) {
      throw createError({ statusCode: 400, statusMessage: result?.userErrors?.[0]?.message || 'Could not start checkout' });
    }

    return { cartId: result.cart.id, checkoutUrl: result.cart.checkoutUrl };
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 502, statusMessage: error?.statusMessage || 'Could not start checkout' });
  }
});
