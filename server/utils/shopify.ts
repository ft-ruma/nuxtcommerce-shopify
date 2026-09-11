// server/utils/shopify.ts
// Thin Shopify Storefront API client. Replaces the old WPGraphQL client.
import { GraphQLClient, ClientError, type Variables } from 'graphql-request';
import { createError, getRequestIP, type H3Event } from 'h3';

export function getShopifyConfig() {
  const config = useRuntimeConfig();
  return {
    domain: String(config.shopifyStoreDomain || '')
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, ''),
    apiVersion: String(config.shopifyApiVersion || '2026-04'),
    publicToken: String(config.shopifyStorefrontToken || ''),
    privateToken: String(config.shopifyStorefrontPrivateToken || ''),
    country: String(config.shopifyCountryCode || '').toUpperCase() || undefined,
    hiddenCollections: String(config.shopifyHiddenCollections || '')
      .split(',')
      .map(h => h.trim().toLowerCase())
      .filter(Boolean),
  };
}

function getClient(event?: H3Event): GraphQLClient {
  const { domain, apiVersion, publicToken, privateToken } = getShopifyConfig();

  if (!domain || (!publicToken && !privateToken)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and a Storefront API token.',
    });
  }

  const headers: Record<string, string> = { 'content-type': 'application/json' };

  if (privateToken) {
    // Server-to-server token (recommended). Buyer IP keeps rate limits per shopper.
    headers['Shopify-Storefront-Private-Token'] = privateToken;
    const ip = event ? getRequestIP(event, { xForwardedFor: true }) : undefined;
    if (ip) headers['Shopify-Storefront-Buyer-IP'] = ip;
  } else {
    headers['X-Shopify-Storefront-Access-Token'] = publicToken;
  }

  return new GraphQLClient(`https://${domain}/api/${apiVersion}/graphql.json`, { headers });
}

function errorMessage(error: any, fallback: string): string {
  if (error instanceof ClientError) {
    return error.response?.errors?.[0]?.message || fallback;
  }
  return error?.message || fallback;
}

export async function shopifyRequest<T = any>(query: string, variables?: Variables, event?: H3Event): Promise<T> {
  try {
    return await getClient(event).request<T>(query, variables);
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 502, statusMessage: errorMessage(error, 'Shopify request failed') });
  }
}

// `quantityAvailable` needs the `unauthenticated_read_product_inventory` scope.
// If the token doesn't have it we retry without inventory instead of breaking the page.
let inventoryAccess: boolean | undefined;

function isInventoryAccessError(error: any): boolean {
  const details = error instanceof ClientError ? JSON.stringify(error.response?.errors ?? []) : String(error?.message ?? '');
  return /quantityAvailable|unauthenticated_read_product_inventory|ACCESS_DENIED/i.test(details);
}

export async function shopifyRequestWithInventory<T = any>(query: string, variables: Variables = {}, event?: H3Event): Promise<T> {
  if (inventoryAccess !== false) {
    try {
      const data = await getClient(event).request<T>(query, { ...variables, withInventory: true });
      inventoryAccess = true;
      return data;
    } catch (error: any) {
      if (!isInventoryAccessError(error)) {
        if (error?.statusCode) throw error;
        throw createError({ statusCode: 502, statusMessage: errorMessage(error, 'Shopify request failed') });
      }
      inventoryAccess = false;
    }
  }
  return shopifyRequest<T>(query, { ...variables, withInventory: false }, event);
}
