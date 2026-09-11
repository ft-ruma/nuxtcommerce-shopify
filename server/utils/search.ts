// server/utils/search.ts

/** Builds a Shopify product search string. Only in-stock products, like the Woo version. */
export function buildProductQuery(term?: string): string {
  const base = 'available_for_sale:true';
  const words = (term ?? '')
    .replace(/[\\"'():*<>=]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  if (!words.length) return base;
  const clauses = words.map(w => `(title:${w}* OR product_type:${w}* OR vendor:${w}* OR tag:${w})`);
  return `${base} AND ${clauses.join(' AND ')}`;
}

/** Local match used when searching inside a collection (collections don't accept a search query). */
export function matchesTerm(product: any, term: string): boolean {
  const haystack = `${product.title} ${product.productType ?? ''} ${product.vendor ?? ''}`.toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every(word => haystack.includes(word));
}
