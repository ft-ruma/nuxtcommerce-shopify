// server/utils/search.ts
import type { CatalogFilters } from '~~/server/utils/catalogFilters';

/** Builds a Shopify product search string, including optional catalog filters. */
export function buildProductQuery(term?: string, filters: Partial<CatalogFilters> = {}): string {
  const parts: string[] = [];

  if (filters.availability === 'out') parts.push('available_for_sale:false');
  else if (filters.availability !== 'all') parts.push('available_for_sale:true');

  if (filters.minPrice != null) parts.push(`price:>=${filters.minPrice}`);
  if (filters.maxPrice != null) parts.push(`price:<=${filters.maxPrice}`);
  if (filters.size) {
    const name = (filters.sizeOption || 'Size').replace(/[\\"'():*<>=]/g, '');
    const value = filters.size.replace(/[\\"'():*<>=]/g, '');
    parts.push(`options:${name}:${value}`);
  }

  const words = (term ?? '')
    .replace(/[\\"'():*<>=]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  if (words.length) {
    const clauses = words.map(w => `(title:${w}* OR product_type:${w}* OR vendor:${w}* OR tag:${w})`);
    parts.push(clauses.join(' AND '));
  }

  return parts.join(' AND ') || 'available_for_sale:true';
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
