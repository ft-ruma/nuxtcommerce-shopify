const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export type MockSize = {
  value: string;
  variantId: number;
  sku: string;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
  stockQuantity: number | null;
};

export type MockProduct = {
  id: number;
  handle: string;
  name: string;
  vendor: string;
  productType: string;
  description: string;
  priceAmount: number;
  compareAtAmount?: number;
  currency: string;
  images: string[];
  sizes: MockSize[];
};

const money = (amount: number) => `Rs ${amount.toFixed(2)}`;
const raw = (amount: number) => amount.toFixed(2);

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 900001,
    handle: 'adidas-ultraboost-run',
    name: 'Adidas Ultraboost Run',
    vendor: 'Adidas',
    productType: 'Footwear',
    description: '<li>Responsive Boost cushioning for all-day miles.</li><li>Primeknit upper with a locked-in heel.</li><li>Mock sample for storefront flow testing.</li>',
    priceAmount: 18900,
    compareAtAmount: 22500,
    currency: 'LKR',
    images: [
      photo('photo-1542291026-7eec264c27ff'),
      photo('photo-1606107557195-0e29a4b5b4aa'),
      photo('photo-1595950653106-6c9ebd614d3a'),
      photo('photo-1600185365483-26d7a4cc7519'),
      photo('photo-1460353581641-37baddab0fa2'),
    ],
    sizes: [
      { value: '8', variantId: 910001, sku: 'ADI-UB-8', stockStatus: 'IN_STOCK', stockQuantity: 6 },
      { value: '9', variantId: 910002, sku: 'ADI-UB-9', stockStatus: 'IN_STOCK', stockQuantity: 4 },
      { value: '10', variantId: 910003, sku: 'ADI-UB-10', stockStatus: 'IN_STOCK', stockQuantity: 5 },
      { value: '11', variantId: 910004, sku: 'ADI-UB-11', stockStatus: 'OUT_OF_STOCK', stockQuantity: 0 },
    ],
  },
  {
    id: 900002,
    handle: 'puma-essentials-hoodie',
    name: 'Puma Essentials Hoodie',
    vendor: 'Puma',
    productType: 'Men',
    description: '<li>Soft fleece hoodie with a kangaroo pocket.</li><li>Ribbed cuffs and hem.</li><li>Mock sample for storefront flow testing.</li>',
    priceAmount: 8900,
    currency: 'LKR',
    images: [
      photo('photo-1556821840-3a63f95609a7'),
      photo('photo-1620799140408-edc6dcb6d633'),
      photo('photo-1578681994506-b8f463449011'),
      photo('photo-1509942774463-70822968b314'),
      photo('photo-1618354691373-d851c5c3a990'),
    ],
    sizes: [
      { value: 'S', variantId: 910011, sku: 'PUMA-HD-S', stockStatus: 'IN_STOCK', stockQuantity: 8 },
      { value: 'M', variantId: 910012, sku: 'PUMA-HD-M', stockStatus: 'IN_STOCK', stockQuantity: 10 },
      { value: 'L', variantId: 910013, sku: 'PUMA-HD-L', stockStatus: 'IN_STOCK', stockQuantity: 7 },
      { value: 'XL', variantId: 910014, sku: 'PUMA-HD-XL', stockStatus: 'IN_STOCK', stockQuantity: 3 },
    ],
  },
  {
    id: 900003,
    handle: 'under-armour-tech-tee',
    name: 'Under Armour Tech Tee',
    vendor: 'Under Armour',
    productType: 'Men',
    description: '<li>Lightweight heatgear fabric that wicks sweat.</li><li>Anti-odour technology.</li><li>Mock sample for storefront flow testing.</li>',
    priceAmount: 4500,
    compareAtAmount: 5900,
    currency: 'LKR',
    images: [
      photo('photo-1521572163474-6864f9cf17ab'),
      photo('photo-1583743814966-8936f5b7be1a'),
      photo('photo-1576566588028-4147f3842f27'),
      photo('photo-1562157873-818bc0726f68'),
      photo('photo-1523381210434-271e8be1f52b'),
    ],
    sizes: [
      { value: 'S', variantId: 910021, sku: 'UA-TEE-S', stockStatus: 'IN_STOCK', stockQuantity: 12 },
      { value: 'M', variantId: 910022, sku: 'UA-TEE-M', stockStatus: 'IN_STOCK', stockQuantity: 9 },
      { value: 'L', variantId: 910023, sku: 'UA-TEE-L', stockStatus: 'IN_STOCK', stockQuantity: 6 },
      { value: 'XL', variantId: 910024, sku: 'UA-TEE-XL', stockStatus: 'OUT_OF_STOCK', stockQuantity: 0 },
    ],
  },
  {
    id: 900004,
    handle: 'allen-solly-oxford-shirt',
    name: 'Allen Solly Oxford Shirt',
    vendor: 'Allen Solly',
    productType: 'Men',
    description: '<li>Classic oxford weave for office and weekend.</li><li>Button-down collar, regular fit.</li><li>Mock sample for storefront flow testing.</li>',
    priceAmount: 7200,
    currency: 'LKR',
    images: [
      photo('photo-1596755094514-f87e34085b2c'),
      photo('photo-1603252109303-2751441dd157'),
      photo('photo-1598033120113-eacf03dcfb2e'),
      photo('photo-1602810318383-e71c9bb6ac1f'),
      photo('photo-1620012253295-c15cc3e65df1'),
    ],
    sizes: [
      { value: 'S', variantId: 910031, sku: 'AS-OX-S', stockStatus: 'IN_STOCK', stockQuantity: 5 },
      { value: 'M', variantId: 910032, sku: 'AS-OX-M', stockStatus: 'IN_STOCK', stockQuantity: 8 },
      { value: 'L', variantId: 910033, sku: 'AS-OX-L', stockStatus: 'IN_STOCK', stockQuantity: 4 },
      { value: 'XL', variantId: 910034, sku: 'AS-OX-XL', stockStatus: 'IN_STOCK', stockQuantity: 2 },
    ],
  },
  {
    id: 900005,
    handle: 'aldo-leather-loafer',
    name: 'ALDO Leather Loafer',
    vendor: 'ALDO',
    productType: 'Footwear',
    description: '<li>Polished leather loafer with a stacked heel.</li><li>Cushioned insole for all-day wear.</li><li>Mock sample for storefront flow testing.</li>',
    priceAmount: 14500,
    compareAtAmount: 16900,
    currency: 'LKR',
    images: [
      photo('photo-1533867617858-e7b97e060509'),
      photo('photo-1614252235816-8c399ad60c48'),
      photo('photo-1449505278894-297fdb3edbc1'),
      photo('photo-1491553895911-0055eca6402d'),
      photo('photo-1582897085656-c636d006a246'),
    ],
    sizes: [
      { value: '7', variantId: 910041, sku: 'ALDO-LF-7', stockStatus: 'IN_STOCK', stockQuantity: 3 },
      { value: '8', variantId: 910042, sku: 'ALDO-LF-8', stockStatus: 'IN_STOCK', stockQuantity: 6 },
      { value: '9', variantId: 910043, sku: 'ALDO-LF-9', stockStatus: 'IN_STOCK', stockQuantity: 5 },
      { value: '10', variantId: 910044, sku: 'ALDO-LF-10', stockStatus: 'IN_STOCK', stockQuantity: 2 },
    ],
  },
];

export function isMockProductId(id?: string | number) {
  const n = Number(id);
  return Number.isInteger(n) && n >= 900001 && n <= 900005;
}

export function isMockVariantId(id?: string | number) {
  const n = Number(id);
  return Number.isInteger(n) && n >= 910001 && n <= 910099;
}

export function findMockProduct(idOrHandle?: string | number) {
  const value = String(idOrHandle ?? '');
  return MOCK_PRODUCTS.find(p => String(p.id) === value || p.handle === value);
}

export function findMockVariant(variantId?: string | number) {
  const id = Number(variantId);
  for (const product of MOCK_PRODUCTS) {
    const size = product.sizes.find(s => s.variantId === id);
    if (size) return { product, size };
  }
}

export function toMockProductCard(product: MockProduct) {
  return {
    databaseId: product.id,
    sku: String(product.id),
    slug: product.handle,
    name: product.name,
    salePrice: money(product.priceAmount),
    regularPrice: money(product.compareAtAmount ?? product.priceAmount),
    allPaStyle: { nodes: [{ name: product.vendor }] },
    image: { sourceUrl: product.images[0] },
    galleryImages: { nodes: product.images.slice(1).map(sourceUrl => ({ sourceUrl })) },
  };
}

export function toMockProductDetail(product: MockProduct) {
  const related = MOCK_PRODUCTS.filter(p => p.id !== product.id).map(toMockProductCard);
  return {
    ...toMockProductCard(product),
    description: product.description,
    allPaColor: { nodes: [{ name: '' }] },
    productTypes: { nodes: [] },
    variations: {
      nodes: product.sizes.map(size => ({
        databaseId: size.variantId,
        sku: size.sku,
        stockStatus: size.stockStatus,
        stockQuantity: size.stockQuantity,
        attributes: { nodes: [{ value: size.value }] },
      })),
    },
    related: { nodes: related },
  };
}

export function toMockCartItem(variantId: number, quantity: number) {
  const found = findMockVariant(variantId);
  if (!found) return null;
  const { product, size } = found;
  if (size.stockStatus !== 'IN_STOCK') return null;
  if (typeof size.stockQuantity === 'number' && quantity > size.stockQuantity) return null;

  return {
    key: String(size.variantId),
    quantity,
    product: {
      node: {
        sku: String(product.id),
        slug: product.handle,
        name: product.name,
      },
    },
    variation: {
      node: {
        name: `${product.name} / ${size.value}`,
        databaseId: size.variantId,
        salePrice: raw(product.priceAmount),
        regularPrice: raw(product.compareAtAmount ?? product.priceAmount),
        stockQuantity: size.stockQuantity,
        stockStatus: size.stockStatus,
        image: { sourceUrl: product.images[0] },
      },
      attributes: [{ value: size.value }],
    },
  };
}

export function mockFilterPayload() {
  const sizeCounts = new Map<string, number>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const product of MOCK_PRODUCTS) {
    min = Math.min(min, product.priceAmount);
    max = Math.max(max, product.priceAmount);
    for (const size of product.sizes) {
      sizeCounts.set(size.value, (sizeCounts.get(size.value) || 0) + 1);
    }
  }

  return {
    sizes: [...sizeCounts.entries()].map(([value, count]) => ({
      label: value,
      value,
      count,
      optionName: 'Size',
    })),
    availability: [
      { label: 'In Stock', value: 'in', count: MOCK_PRODUCTS.length },
      { label: 'Out Of Stock', value: 'out', count: 0 },
    ],
    price: {
      min: 0,
      max: Math.max(25000, Math.ceil(max)),
      currency: 'LKR',
      prefix: 'Rs',
    },
  };
}

export function filterMockProducts(options: { term?: string; size?: string; availability?: string; minPrice?: number; maxPrice?: number } = {}) {
  const term = options.term?.trim().toLowerCase();
  return MOCK_PRODUCTS.filter(product => {
    if (term) {
      const haystack = `${product.name} ${product.vendor} ${product.productType}`.toLowerCase();
      if (!term.split(/\s+/).every(word => haystack.includes(word))) return false;
    }
    if (options.availability === 'out') return false;
    if (options.size && !product.sizes.some(size => size.value.toLowerCase() === options.size!.toLowerCase() && size.stockStatus === 'IN_STOCK')) return false;
    if (options.minPrice != null && product.priceAmount < options.minPrice) return false;
    if (options.maxPrice != null && product.priceAmount > options.maxPrice) return false;
    return true;
  });
}
