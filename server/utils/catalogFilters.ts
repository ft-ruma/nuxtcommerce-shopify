// Shared catalog filter parsing for Shopify collection ProductFilter
// and the global products search query.

export type AvailabilityFilter = 'in' | 'out' | 'all';

export type CatalogFilters = {
  size?: string;
  sizeOption?: string;
  availability: AvailabilityFilter;
  minPrice?: number;
  maxPrice?: number;
};

export type FilterValue = {
  label: string;
  value: string;
  count: number;
  optionName?: string;
};

export type CatalogFilterPayload = {
  sizes: FilterValue[];
  availability: FilterValue[];
  price: {
    min: number;
    max: number;
    currency: string;
    prefix: string;
  };
};

const COLOR_OPTION = /^(colou?r|farbe|kleur|farge|farve|färg)$/i;
const SIZE_OPTION = /size|sz|länge|lengte|maat|taille|width|length|\buk\b|\beu\b|\bus\b/i;
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL', '6XL'];

export function parseNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseCatalogFilters(query: Record<string, string | undefined>): CatalogFilters {
  const availability = query.availability;
  return {
    size: query.size?.trim() || undefined,
    sizeOption: query.sizeOption?.trim() || undefined,
    availability: availability === 'out' ? 'out' : availability === 'all' ? 'all' : 'in',
    minPrice: parseNumber(query.minPrice),
    maxPrice: parseNumber(query.maxPrice),
  };
}

export function isSizeOptionName(name = ''): boolean {
  if (COLOR_OPTION.test(name.trim())) return false;
  return SIZE_OPTION.test(name);
}

export function currencyPrefix(code?: string): string {
  if (!code || ['LKR', 'INR', 'PKR', 'NPR', 'MUR'].includes(code.toUpperCase())) return 'Rs';
  return code;
}

export function parseFilterInput(input: unknown): Record<string, any> {
  if (!input) return {};
  if (typeof input === 'object') return input as Record<string, any>;
  try {
    return JSON.parse(String(input));
  } catch {
    return {};
  }
}

export function sizeRank(label: string): number {
  const key = label.trim().toUpperCase().replace(/\s+/g, '');
  const index = SIZE_ORDER.indexOf(key);
  if (index >= 0) return index;
  const numeric = parseFloat(label);
  if (!Number.isNaN(numeric)) return 100 + numeric;
  return 200 + key.charCodeAt(0);
}

export function sortSizes<T extends { label: string }>(sizes: T[]): T[] {
  return [...sizes].sort((a, b) => sizeRank(a.label) - sizeRank(b.label) || a.label.localeCompare(b.label));
}

export function optionValues(option: any): string[] {
  if (!option) return [];
  if (Array.isArray(option.optionValues)) return option.optionValues.map((v: any) => String(v.name ?? v));
  if (Array.isArray(option.values)) return option.values.map((v: any) => String(v.name ?? v));
  return [];
}

export function productSizeValues(product: any): string[] {
  const options = product.options ?? [];
  const sizeOptions = options.filter((o: any) => isSizeOptionName(o.name));
  const source = sizeOptions.length ? sizeOptions : options.filter((o: any) => !COLOR_OPTION.test(String(o.name ?? '')));
  return [...new Set(source.flatMap(optionValues))];
}

export function productMinPrice(product: any): number {
  const amount = product.priceRange?.minVariantPrice?.amount ?? product.selectedOrFirstAvailableVariant?.price?.amount;
  const n = Number(amount);
  return Number.isFinite(n) ? n : 0;
}

export function productCurrency(product: any): string | undefined {
  return product.priceRange?.minVariantPrice?.currencyCode ?? product.selectedOrFirstAvailableVariant?.price?.currencyCode;
}

export function matchesCatalogFilters(product: any, filters: CatalogFilters): boolean {
  if (filters.availability === 'in' && product.availableForSale === false) return false;
  if (filters.availability === 'out' && product.availableForSale !== false) return false;
  if (filters.size) {
    const sizes = productSizeValues(product).map(v => v.toLowerCase());
    if (!sizes.includes(filters.size.toLowerCase())) return false;
  }
  const price = productMinPrice(product);
  if (filters.minPrice != null && price < filters.minPrice) return false;
  if (filters.maxPrice != null && price > filters.maxPrice) return false;
  return true;
}

export function toShopifyProductFilters(filters: CatalogFilters): Array<Record<string, any>> {
  const list: Array<Record<string, any>> = [];
  if (filters.availability === 'out') list.push({ available: false });
  else if (filters.availability !== 'all') list.push({ available: true });
  if (filters.size) {
    list.push({ variantOption: { name: filters.sizeOption || 'Size', value: filters.size } });
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    const price: Record<string, number> = {};
    if (filters.minPrice != null) price.min = filters.minPrice;
    if (filters.maxPrice != null) price.max = filters.maxPrice;
    list.push({ price });
  }
  return list;
}

export function emptyFilterPayload(overrides: Partial<CatalogFilterPayload> = {}): CatalogFilterPayload {
  return {
    sizes: [],
    availability: [
      { label: 'In Stock', value: 'in', count: 0 },
      { label: 'Out Of Stock', value: 'out', count: 0 },
    ],
    price: { min: 0, max: 25000, currency: 'LKR', prefix: 'Rs' },
    ...overrides,
  };
}

export function mapShopifyFilters(groups: any[] = []): CatalogFilterPayload {
  const payload = emptyFilterPayload();
  let sizeOption = 'Size';

  for (const group of groups) {
    const label = String(group.label ?? '');
    const id = String(group.id ?? '').toLowerCase();
    const type = String(group.type ?? '').toUpperCase();
    const values = Array.isArray(group.values) ? group.values : [];

    const isPrice = type === 'PRICE_RANGE' || /price/.test(id) || /^price$/i.test(label);
    const isAvailability = /available|availability|stock/.test(`${id} ${label}`);
    const isSize = isSizeOptionName(label) || /size/.test(id);

    if (isPrice) {
      const parsed = values.map((v: any) => parseFilterInput(v.input)).find((v: any) => v.price) ?? parseFilterInput(values[0]?.input);
      const min = Number(parsed.price?.min ?? 0);
      const max = Number(parsed.price?.max ?? payload.price.max);
      payload.price.min = Number.isFinite(min) ? min : 0;
      payload.price.max = Number.isFinite(max) && max > payload.price.min ? max : 25000;
      continue;
    }

    if (isAvailability) {
      const mapped = new Map<string, FilterValue>();
      for (const v of values) {
        const parsed = parseFilterInput(v.input);
        const label = String(v.label ?? '').toLowerCase();
        const available = parsed.available === true || (parsed.available !== false && !label.includes('out'));
        const value = available ? 'in' : 'out';
        mapped.set(value, {
          label: available ? 'In Stock' : 'Out Of Stock',
          value,
          count: Number(v.count) || 0,
        });
      }
      payload.availability = [
        mapped.get('in') || { label: 'In Stock', value: 'in', count: 0 },
        mapped.get('out') || { label: 'Out Of Stock', value: 'out', count: 0 },
      ];
      continue;
    }

    if (isSize) {
      payload.sizes = sortSizes(
        values.map((v: any) => {
          const parsed = parseFilterInput(v.input);
          const optionName = parsed.variantOption?.name || label || 'Size';
          sizeOption = optionName;
          return {
            label: String(v.label ?? parsed.variantOption?.value ?? ''),
            value: String(parsed.variantOption?.value ?? v.label ?? ''),
            count: Number(v.count) || 0,
            optionName,
          };
        }).filter((v: FilterValue) => v.label)
      );
    }
  }

  if (payload.sizes[0]?.optionName) sizeOption = payload.sizes[0].optionName;
  payload.sizes = payload.sizes.map(size => ({ ...size, optionName: size.optionName || sizeOption }));
  return payload;
}

export function aggregateFromProducts(products: any[]): CatalogFilterPayload {
  const sizeCounts = new Map<string, { count: number; optionName: string }>();
  let inStock = 0;
  let outStock = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  let currency = 'LKR';

  for (const product of products) {
    if (product.availableForSale === false) outStock += 1;
    else inStock += 1;

    const price = productMinPrice(product);
    if (price < min) min = price;
    if (price > max) max = price;
    currency = productCurrency(product) || currency;

    const options = product.options ?? [];
    const sizeOptions = options.filter((o: any) => isSizeOptionName(o.name));
    for (const option of sizeOptions) {
      for (const value of optionValues(option)) {
        const current = sizeCounts.get(value) || { count: 0, optionName: option.name };
        current.count += 1;
        sizeCounts.set(value, current);
      }
    }
  }

  if (!Number.isFinite(min)) min = 0;
  if (max < min) max = 25000;

  return {
    sizes: sortSizes(
      [...sizeCounts.entries()].map(([value, meta]) => ({
        label: value,
        value,
        count: meta.count,
        optionName: meta.optionName,
      }))
    ),
    availability: [
      { label: 'In Stock', value: 'in', count: inStock },
      { label: 'Out Of Stock', value: 'out', count: outStock },
    ],
    price: {
      min: Math.floor(min),
      max: Math.ceil(max) || 25000,
      currency,
      prefix: currencyPrefix(currency),
    },
  };
}
