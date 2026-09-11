// server/utils/shopifyMappers.ts
// Maps Shopify Storefront API data into the same shapes the (unchanged) UI
// components expected from WooCommerce/WPGraphQL. This is what keeps the design identical.

type Money = { amount: string; currencyCode: string } | null | undefined;

const COLOR_OPTION = /^(colou?r|farbe|kleur|farge|farve|färg)$/i;
const DEFAULT_TITLE = 'Default Title';
const ONE_SIZE = 'One size';

export const toNumericId = (gid?: string | null): string => (gid ? gid.split('/').pop()!.split('?')[0]! : '');
export const toGid = (type: 'Product' | 'ProductVariant', id: string | number): string => `gid://shopify/${type}/${id}`;

export const slugify = (value: string): string =>
  value
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const baseUrl = (url?: string | null) => (url ? url.split('?')[0] : '');

export function formatMoney(money: Money): string {
  if (!money) return '';
  const amount = Number(money.amount);
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: money.currencyCode }).format(amount);
  } catch {
    return `${money.currencyCode} ${amount.toFixed(2)}`;
  }
}

/** Woo-style prices: salePrice = current price, regularPrice = compare-at price when on sale. */
function prices(price: Money, compareAt: Money, format: (m: Money) => string) {
  const onSale = !!compareAt && Number(compareAt.amount) > Number(price?.amount ?? 0);
  return {
    salePrice: format(price),
    regularPrice: format(onSale ? compareAt : price),
  };
}

const rawMoney = (money: Money) => (money ? Number(money.amount).toFixed(2) : '0.00');

const isColorOption = (name: string) => COLOR_OPTION.test(name.trim());

function sizeAttributes(selectedOptions: Array<{ name: string; value: string }> = []) {
  const values = selectedOptions.filter(o => !isColorOption(o.name) && o.value !== DEFAULT_TITLE).map(o => ({ value: o.value }));
  return values.length ? values : [{ value: ONE_SIZE }];
}

/**
 * Max quantity a shopper can add, or null when there is no limit
 * (inventory not tracked, overselling allowed, or inventory scope not granted).
 */
export function stockLimit(variant: { availableForSale?: boolean; currentlyNotInStock?: boolean; quantityAvailable?: number | null }): number | null {
  const qty = variant.quantityAvailable;
  if (typeof qty !== 'number' || variant.currentlyNotInStock || qty <= 0) return null;
  return qty;
}

const subtitle = (p: { productType?: string; vendor?: string }) => ({ nodes: [{ name: p.productType || p.vendor || '' }] });

/** Product card shape used by ProductCard, the search dropdown, favorites and related products. */
export function mapProductCard(p: any) {
  const images: string[] = (p.images?.nodes ?? []).map((i: any) => i.url);
  const main = p.featuredImage?.url || images[0] || '';
  const second = images.find(url => baseUrl(url) !== baseUrl(main)) || main;
  const variant = p.selectedOrFirstAvailableVariant;
  const productId = toNumericId(p.id);

  return {
    databaseId: Number(productId),
    sku: productId, // used in URLs: /product/{handle}-{productId}
    slug: p.handle,
    name: p.title,
    ...prices(variant?.price, variant?.compareAtPrice, formatMoney),
    allPaStyle: subtitle(p),
    image: { sourceUrl: main },
    galleryImages: { nodes: [{ sourceUrl: second }] },
  };
}

/**
 * Product detail shape for pages/product/[id].vue.
 * Shopify "Color" option values become the colour swatches (Woo used separate products per colour),
 * the remaining options (usually Size) become the size buttons.
 */
export function mapProductDetail(p: any, colorSlug: string, related: any[]) {
  const productId = toNumericId(p.id);
  const variants: any[] = p.variants?.nodes ?? [];
  const colorOptionName: string | undefined = (p.options ?? []).map((o: any) => o.name).find(isColorOption);

  const colorOf = (v: any) => v.selectedOptions?.find((o: any) => o.name === colorOptionName)?.value as string | undefined;

  // Only colours with at least one variant in stock get a swatch (mirrors Woo's IN_STOCK filter).
  const colors: string[] = colorOptionName
    ? (p.options.find((o: any) => o.name === colorOptionName)?.optionValues ?? [])
        .map((v: any) => v.name as string)
        .filter((c: string) => variants.some(v => colorOf(v) === c && v.availableForSale))
    : [];

  const firstAvailable = variants.find(v => v.availableForSale) ?? variants[0];
  const selectedColor = colorOptionName ? colors.find(c => slugify(c) === colorSlug) ?? (firstAvailable && colorOf(firstAvailable)) ?? colors[0] ?? '' : '';

  const colorVariants = colorOptionName ? variants.filter(v => colorOf(v) === selectedColor) : variants;
  const priceVariant = colorVariants.find(v => v.availableForSale) ?? colorVariants[0] ?? firstAvailable;

  const allImages: string[] = (p.images?.nodes ?? []).map((i: any) => i.url);
  const mainImage = colorVariants.find(v => v.image?.url)?.image?.url || p.featuredImage?.url || allImages[0] || '';
  const gallery = allImages.filter(url => baseUrl(url) !== baseUrl(mainImage));

  const swatches = colors.map(color => {
    const withImage = variants.find(v => colorOf(v) === color && v.image?.thumb);
    return {
      slug: `${p.handle}-${slugify(color)}`,
      image: { sourceUrl: withImage?.image?.thumb || mainImage },
      allPaColor: { nodes: [{ name: color }] },
    };
  });

  return {
    databaseId: Number(productId),
    sku: productId,
    slug: selectedColor ? `${p.handle}-${slugify(selectedColor)}` : p.handle,
    name: p.title,
    ...prices(priceVariant?.price, priceVariant?.compareAtPrice, formatMoney),
    description: p.descriptionHtml,
    image: { sourceUrl: mainImage },
    galleryImages: { nodes: gallery.map(url => ({ sourceUrl: url })) },
    allPaColor: { nodes: [{ name: selectedColor }] },
    allPaStyle: subtitle(p),
    productTypes: { nodes: swatches.length ? [{ products: { nodes: swatches } }] : [] },
    variations: {
      nodes: colorVariants.map(v => ({
        databaseId: Number(toNumericId(v.id)),
        sku: v.sku || '',
        stockStatus: v.availableForSale ? 'IN_STOCK' : 'OUT_OF_STOCK',
        stockQuantity: stockLimit(v),
        attributes: { nodes: sizeAttributes(v.selectedOptions) },
      })),
    },
    related: { nodes: related.map(mapProductCard) },
  };
}

/** Cart line shape stored in localStorage and rendered by Cart.vue. */
export function mapCartItem(v: any, quantity: number) {
  const variantId = toNumericId(v.id);
  return {
    key: variantId,
    quantity,
    product: {
      node: {
        sku: toNumericId(v.product?.id),
        slug: v.product?.handle,
        name: v.product?.title,
      },
    },
    variation: {
      node: {
        name: v.title,
        databaseId: Number(variantId),
        ...prices(v.price, v.compareAtPrice, rawMoney),
        stockQuantity: stockLimit(v),
        stockStatus: v.availableForSale ? 'IN_STOCK' : 'OUT_OF_STOCK',
        image: { sourceUrl: v.image?.url || v.product?.featuredImage?.url || '' },
      },
      attributes: sizeAttributes(v.selectedOptions),
    },
  };
}

/** Category shape used by categories.vue / CarouselCategories.vue. */
export function mapCollection(c: any) {
  const node = {
    name: c.title,
    image: c.image?.url ? { sourceUrl: c.image.url } : null,
    products: { nodes: (c.products?.nodes ?? []).map((n: any) => ({ id: n.id })) },
  };
  return {
    id: c.id,
    handle: c.handle,
    ...node,
    // Shopify collections are flat. The UI only lists categories that have children
    // (a WooCommerce hierarchy rule), so each collection lists itself as its child.
    children: { nodes: [node] },
  };
}
