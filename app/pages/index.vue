<!--app/pages/index.vue-->
<script setup>
const route = useRoute();
const { name } = useAppConfig().site;
const url = useRequestURL();
const localePath = useLocalePath();
const canonical = computed(() => {
  const base = `${url.origin}${url.pathname}`;
  const params = new URLSearchParams();
  if (typeof route.query.q === 'string' && route.query.q) params.set('q', route.query.q);
  if (typeof route.query.category === 'string' && route.query.category) params.set('category', route.query.category);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
});

useHead(() => {
  const q = typeof route.query.q === 'string' ? route.query.q : undefined;
  const category = typeof route.query.category === 'string' ? route.query.category : undefined;

  let title = '';
  let description = '';
  const keywords = new Set(['ecommerce', name]);

  if (category) {
    title = `${category} Products`;
    description = `Browse ${category} products on ${name}.`;
    keywords.add(category);
  }

  if (q) {
    title = `Search results for "${q}"`;
    description = `Search results for "${q}" on ${name}.`;
    keywords.add(q);
  }

  const canonicalUrl = canonical.value;

  return {
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogUrl: canonicalUrl,
    canonical: canonicalUrl,
    keywords: Array.from(keywords).join(', '),
    twitterTitle: title,
    twitterDescription: description,
    ogImage: 'https://commerce.nuxt.dev/social-card.jpg',
    twitterImage: 'https://commerce.nuxt.dev/social-card.jpg',
  };
});

const productsData = ref([]);
const isLoading = ref(false);
const hasFetched = ref(false);
const tailEl = ref(null);
const activeHeroIndex = ref(0);
const heroHover = ref(false);
const pageInfo = ref({ hasNextPage: true, endCursor: null });
let heroTimer;

const photo = (id, width = 1800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const heroSlides = [
  {
    title: "Men's Collection",
    eyebrow: 'Office to casual',
    description: 'Long sleeve shirts, denim, activewear and everyday essentials.',
    image: photo('photo-1488161628813-04466f872be2'),
    fallback: '/hero-men.svg',
    bgClass: 'bg-gradient-to-br from-zinc-950 via-neutral-800 to-red-950',
    category: 'Men',
  },
  {
    title: "Women's Edit",
    eyebrow: 'New season style',
    description: 'Frocks, blouses, skirts, denim and polished office wear.',
    image: photo('photo-1483985988355-763728e1935b'),
    fallback: '/hero-women.svg',
    bgClass: 'bg-gradient-to-br from-rose-950 via-pink-800 to-orange-700',
    category: 'Women',
  },
  {
    title: 'Kids New In',
    eyebrow: 'Age-friendly shopping',
    description: 'Simple paths for baby, kids, boys, girls and teens.',
    image: photo('photo-1503454537195-1dcabb73ffb9'),
    fallback: '/hero-kids.svg',
    bgClass: 'bg-gradient-to-br from-slate-950 via-sky-800 to-emerald-700',
    category: 'Kids',
  },
  {
    title: 'Footwear Drop',
    eyebrow: 'Step into brands',
    description: 'Shoes, sandals, slippers and slides for every customer.',
    image: photo('photo-1542291026-7eec264c27ff'),
    fallback: '/hero-footwear.svg',
    bgClass: 'bg-gradient-to-br from-indigo-950 via-violet-800 to-cyan-700',
    category: 'Footwear',
  },
  {
    title: 'Shop By Brand',
    eyebrow: 'Multi-brand discovery',
    description: 'Find Adidas, Puma, Crocodile, ALDO, Titan and more.',
    image: photo('photo-1441986300917-64674bd600d8'),
    fallback: '/hero-brands.svg',
    bgClass: 'bg-gradient-to-br from-black via-neutral-800 to-red-900',
    search: 'brand',
  },
];

const shopTiles = [
  { label: 'Men', caption: 'Shirts, denim and office wear', category: 'Men', image: photo('photo-1488161628813-04466f872be2', 1200), fallback: '/hero-men.svg', span: 'lg:col-span-6', minH: 'min-h-[260px] lg:min-h-[340px]' },
  { label: 'Women', caption: 'Frocks, blouses and new season', category: 'Women', image: photo('photo-1483985988355-763728e1935b', 1200), fallback: '/hero-women.svg', span: 'lg:col-span-6', minH: 'min-h-[260px] lg:min-h-[340px]' },
  { label: 'Kids', caption: 'Baby to teens', category: 'Kids', image: photo('photo-1503454537195-1dcabb73ffb9', 900), fallback: '/hero-kids.svg', span: 'lg:col-span-3', minH: 'min-h-[220px] lg:min-h-[260px]' },
  { label: 'Accessories', caption: 'Bags, belts and extras', category: 'Accessories', image: photo('photo-1590874103328-eac38a941956', 900), fallback: '/hero-accessories.svg', span: 'lg:col-span-3', minH: 'min-h-[220px] lg:min-h-[260px]' },
  { label: 'Footwear', caption: 'Shoes, slides and sandals', category: 'Footwear', image: photo('photo-1542291026-7eec264c27ff', 900), fallback: '/hero-footwear.svg', span: 'lg:col-span-3', minH: 'min-h-[220px] lg:min-h-[260px]' },
  { label: 'Brands', caption: 'Shop the labels', search: 'brand', image: photo('photo-1441986300917-64674bd600d8', 900), fallback: '/hero-brands.svg', span: 'lg:col-span-3', minH: 'min-h-[220px] lg:min-h-[260px]' },
];

const brandItems = ['Allen Solly', 'Adidas', 'Under Armour', 'Puma', 'ALDO', 'U.S. POLO ASSN.', 'Amanthe', 'Crocodile', 'Skechers', 'Titan', 'Miniso', 'Waves'];

const isHomeView = computed(() => !route.query.q && !route.query.category);
const activeHeroSlide = computed(() => heroSlides[activeHeroIndex.value]);
const catalogTitle = computed(() => {
  if (route.query.category && route.query.q) return `${route.query.category} · “${route.query.q}”`;
  if (route.query.category) return String(route.query.category);
  if (route.query.q) return `Search “${route.query.q}”`;
  return 'New arrivals';
});
const slideLink = slide => (slide.search ? localePath(`/?q=${encodeURIComponent(slide.search)}`) : localePath(`/?category=${encodeURIComponent(slide.category)}`));
const useImageFallback = (event, fallback) => {
  if (event.target.dataset.fallbackApplied) return;
  event.target.dataset.fallbackApplied = 'true';
  event.target.src = fallback;
};

const setHeroSlide = index => {
  activeHeroIndex.value = index;
};

const nextHeroSlide = () => {
  activeHeroIndex.value = (activeHeroIndex.value + 1) % heroSlides.length;
};

const prevHeroSlide = () => {
  activeHeroIndex.value = (activeHeroIndex.value - 1 + heroSlides.length) % heroSlides.length;
};

const variables = computed(() => ({
  search: route.query.q,
  order: route.query.orderby?.toUpperCase() || 'DESC',
  field: route.query.fieldby?.toUpperCase() || 'DATE',
  category: route.query.category,
  after: pageInfo.value.endCursor,
}));

async function fetch() {
  if (isLoading.value || !pageInfo.value.hasNextPage) return;
  isLoading.value = true;

  try {
    const response = await $fetch('/api/products', {
      query: variables.value,
    });
    productsData.value.push(...response.products.nodes);
    pageInfo.value = response.products.pageInfo;
    hasFetched.value = true;
  } catch {
    hasFetched.value = true;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetch();
  heroTimer = window.setInterval(() => {
    if (!heroHover.value) nextHeroSlide();
  }, 5500);
});

onBeforeUnmount(() => {
  window.clearInterval(heroTimer);
});

useIntervalFn(() => {
  if (!tailEl.value || isLoading.value) return;
  const { top } = tailEl.value.getBoundingClientRect();
  if (top - window.innerHeight < 400) {
    fetch();
  }
}, 500);

watch(
  () => route.query,
  () => {
    productsData.value = [];
    pageInfo.value = { hasNextPage: true, endCursor: null };
    fetch();
  }
);

const products = computed(() => productsData.value);
const productsEmpty = computed(() => hasFetched.value && !isLoading.value && productsData.value.length === 0);
</script>

<template>
  <section v-if="isHomeView" class="px-3 pt-3 lg:px-5 lg:pt-5">
    <div
      class="relative mx-auto max-w-screen-2xl overflow-hidden rounded-[2rem] bg-zinc-950 text-white shadow-2xl"
      @mouseenter="heroHover = true"
      @mouseleave="heroHover = false">
      <div
        v-for="(slide, index) in heroSlides"
        :key="slide.title"
        class="absolute inset-0 transition-opacity duration-700 ease-out"
        :class="activeHeroIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0'">
        <div class="absolute inset-0" :class="slide.bgClass"></div>
        <img
          :src="slide.image"
          :alt="slide.title"
          class="absolute inset-0 h-full w-full object-cover"
          :loading="index === 0 ? 'eager' : 'lazy'"
          @error="useImageFallback($event, slide.fallback)" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10"></div>

      <NuxtLink :to="slideLink(activeHeroSlide)" class="relative z-10 flex min-h-[420px] flex-col justify-end p-6 pb-24 lg:min-h-[560px] lg:p-12 lg:pb-28">
        <div class="max-w-2xl">
          <div class="mb-4 text-xs font-black uppercase tracking-[0.3em] text-white/70">{{ activeHeroSlide.eyebrow }}</div>
          <h1 class="text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">{{ activeHeroSlide.title }}</h1>
          <p class="mt-4 max-w-xl text-base font-semibold text-white/85 md:text-xl">{{ activeHeroSlide.description }}</p>
          <div class="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-neutral-200">
            Shop now
          </div>
        </div>
      </NuxtLink>

      <button
        type="button"
        aria-label="Previous slide"
        class="absolute bottom-6 right-20 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl font-black text-white backdrop-blur transition hover:bg-white hover:text-black"
        @click.stop="prevHeroSlide">
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        class="absolute bottom-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl font-black text-white backdrop-blur transition hover:bg-white hover:text-black"
        @click.stop="nextHeroSlide">
        ›
      </button>

      <div class="absolute bottom-7 left-6 z-20 flex gap-2 lg:left-12">
        <button
          v-for="(slide, index) in heroSlides"
          :key="slide.title"
          type="button"
          :aria-label="`Show ${slide.title}`"
          :class="['h-2.5 rounded-full transition-all', activeHeroIndex === index ? 'w-10 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70']"
          @click.stop="setHeroSlide(index)" />
      </div>
    </div>

    <div class="mx-auto mt-10 max-w-screen-2xl">
      <div class="mb-5 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">Collections</p>
          <h2 class="mt-1 text-3xl font-black tracking-tight">Shop by category</h2>
        </div>
        <NuxtLink :to="localePath('/categories')" class="hidden rounded-full bg-black/5 px-4 py-2 text-sm font-bold transition hover:bg-black hover:text-white dark:bg-white/10 dark:hover:bg-white dark:hover:text-black sm:inline-flex">
          View all
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-12 lg:gap-4">
        <NuxtLink
          v-for="tile in shopTiles"
          :key="tile.label"
          :to="slideLink(tile)"
          :class="['group relative block overflow-hidden rounded-[1.75rem] text-white', tile.span]">
          <div :class="tile.minH"></div>
          <div class="absolute inset-0 bg-neutral-900"></div>
          <img
            :src="tile.image"
            :alt="tile.label"
            class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
            @error="useImageFallback($event, tile.fallback)" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10"></div>
          <div class="absolute inset-0 flex flex-col justify-end p-5 lg:p-7">
            <div class="text-2xl font-black tracking-tight lg:text-3xl">{{ tile.label }}</div>
            <p class="mt-1 text-sm font-semibold text-white/80">{{ tile.caption }}</p>
            <span class="mt-4 inline-flex w-max rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase tracking-wide backdrop-blur transition group-hover:bg-white group-hover:text-black">
              Shop
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div class="mx-auto mt-4 grid max-w-screen-2xl gap-3 md:grid-cols-2 lg:gap-4">
      <NuxtLink :to="localePath('/?category=Sale')" class="relative min-h-[200px] overflow-hidden rounded-[1.75rem] bg-[#b31015] p-8 text-white">
        <div class="text-xs font-black uppercase tracking-[0.28em] text-white/70">Limited time</div>
        <h3 class="mt-3 text-4xl font-black">Sale</h3>
        <p class="mt-2 max-w-sm text-base font-semibold text-white/85">Markdowns on selected brands, seasonal styles and last-size footwear.</p>
        <span class="mt-8 inline-flex rounded-full bg-white px-5 py-2 text-sm font-black uppercase tracking-wide text-black">Shop sale</span>
      </NuxtLink>
      <NuxtLink :to="localePath('/?category=New Arrivals')" class="relative min-h-[200px] overflow-hidden rounded-[1.75rem] bg-neutral-100 p-8 dark:bg-white/10">
        <div class="text-xs font-black uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">Just landed</div>
        <h3 class="mt-3 text-4xl font-black">New arrivals</h3>
        <p class="mt-2 max-w-sm text-base font-semibold text-neutral-600 dark:text-neutral-300">Fresh drops across men, women, kids and accessories.</p>
        <span class="mt-8 inline-flex rounded-full bg-black px-5 py-2 text-sm font-black uppercase tracking-wide text-white dark:bg-white dark:text-black">See what's new</span>
      </NuxtLink>
    </div>

    <div class="mx-auto mt-10 max-w-screen-2xl">
      <div class="mb-5">
        <p class="text-xs font-black uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">Featured labels</p>
        <h2 class="mt-1 text-3xl font-black tracking-tight">Shop by brand</h2>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <NuxtLink
          v-for="brand in brandItems"
          :key="brand"
          :to="localePath(`/?q=${encodeURIComponent(brand)}`)"
          class="rounded-2xl bg-black/5 px-4 py-5 text-center text-sm font-black uppercase tracking-wide transition hover:bg-black hover:text-white dark:bg-white/10 dark:hover:bg-white dark:hover:text-black">
          {{ brand }}
        </NuxtLink>
      </div>
    </div>
  </section>

  <section v-else class="px-3 pt-6 lg:px-5">
    <div class="mx-auto max-w-screen-2xl">
      <NuxtLink :to="localePath('/')" class="text-xs font-black uppercase tracking-[0.28em] text-neutral-500 transition hover:text-black dark:hover:text-white">Home</NuxtLink>
      <h1 class="mt-2 text-4xl font-black tracking-tight">{{ catalogTitle }}</h1>
    </div>
  </section>

  <div v-if="isHomeView" class="mx-auto flex max-w-screen-2xl items-end justify-between gap-3 px-3 pt-10 lg:px-5">
    <div>
      <p class="text-xs font-black uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">Catalog</p>
      <h2 class="text-3xl font-black tracking-tight">New arrivals</h2>
    </div>
    <ButtonSortBy align="end" />
  </div>
  <div v-else class="flex items-center px-3 pt-5 lg:px-5">
    <ButtonSortBy />
    <ButtonSelectCategory />
  </div>

  <div v-if="!productsEmpty" class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-3 lg:gap-5 p-3 lg:p-5">
    <ProductCard :products="products" />
    <ProductsSkeleton v-if="(!products.length || isLoading) && !productsEmpty" />
    <br ref="tailEl" />
  </div>
  <div v-else-if="isHomeView" class="mx-auto max-w-screen-2xl px-3 py-16 text-center lg:px-5">
    <p class="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">Coming soon</p>
    <h3 class="mt-3 text-3xl font-black">Explore the collections above</h3>
    <p class="mx-auto mt-3 max-w-md text-sm font-semibold text-neutral-500 dark:text-neutral-400">New product drops from the Shopify catalog will appear here as they become available.</p>
  </div>
  <ProductsEmpty v-else />
</template>
