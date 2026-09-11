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
const pageInfo = ref({ hasNextPage: true, endCursor: null });
let heroTimer;

const heroSlides = [
  { title: "Men's Collection", eyebrow: 'Office to casual', description: 'Long sleeve shirts, denim, activewear and everyday essentials.', image: '/hero-men.svg?v=2', category: 'Men' },
  { title: "Women's Edit", eyebrow: 'New season style', description: 'Frocks, blouses, skirts, denim and polished office wear.', image: '/hero-women.svg?v=2', category: 'Women' },
  { title: 'Kids New In', eyebrow: 'Age-friendly shopping', description: 'Simple paths for baby, kids, boys, girls and teens.', image: '/hero-kids.svg?v=2', category: 'Kids' },
  { title: 'Footwear Drop', eyebrow: 'Step into brands', description: 'Shoes, sandals, slippers and slides for every customer.', image: '/hero-footwear.svg?v=2', category: 'Footwear' },
  { title: 'Shop By Brand', eyebrow: 'Multi-brand discovery', description: 'Find Adidas, Puma, Crocodile, ALDO, Titan and more.', image: '/hero-brands.svg?v=2', search: 'brand' },
];

const shopTiles = [
  { label: 'MEN', category: 'Men' },
  { label: 'WOMEN', category: 'Women' },
  { label: 'KIDS', category: 'Kids' },
  { label: 'ACCESSORIES', category: 'Accessories' },
  { label: 'FOOTWEAR', category: 'Footwear' },
  { label: 'BRANDS', search: 'brand' },
];

const isHomeView = computed(() => !route.query.q && !route.query.category);
const activeHeroSlide = computed(() => heroSlides[activeHeroIndex.value]);
const slideLink = slide => (slide.search ? localePath(`/?q=${encodeURIComponent(slide.search)}`) : localePath(`/?category=${encodeURIComponent(slide.category)}`));

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
  heroTimer = window.setInterval(nextHeroSlide, 5000);
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
    <div class="relative mx-auto max-w-screen-2xl overflow-hidden rounded-[2rem] bg-black text-white shadow-2xl">
      <Transition name="dropdown" mode="out-in">
        <NuxtLink :key="activeHeroSlide.image" :to="slideLink(activeHeroSlide)" class="relative block min-h-[420px] overflow-hidden lg:min-h-[560px]">
          <img :src="activeHeroSlide.image" :alt="activeHeroSlide.title" class="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
          <div class="relative z-10 flex min-h-[420px] max-w-3xl flex-col justify-end p-6 pb-20 lg:min-h-[560px] lg:p-12 lg:pb-24">
            <div class="mb-4 text-xs font-black uppercase tracking-[0.3em] text-white/75">{{ activeHeroSlide.eyebrow }}</div>
            <h1 class="text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">{{ activeHeroSlide.title }}</h1>
            <p class="mt-4 max-w-xl text-base font-semibold text-white/85 md:text-xl">{{ activeHeroSlide.description }}</p>
            <div class="mt-8 flex w-max rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-neutral-200">
              Shop Now
            </div>
          </div>
        </NuxtLink>
      </Transition>

      <button
        type="button"
        aria-label="Previous slide"
        class="absolute bottom-6 right-20 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-2xl font-black backdrop-blur transition hover:bg-white hover:text-black"
        @click="prevHeroSlide">
        &lt;
      </button>
      <button
        type="button"
        aria-label="Next slide"
        class="absolute bottom-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-2xl font-black backdrop-blur transition hover:bg-white hover:text-black"
        @click="nextHeroSlide">
        &gt;
      </button>

      <div class="absolute bottom-7 left-6 z-20 flex gap-2 lg:left-12">
        <button
          v-for="(slide, index) in heroSlides"
          :key="slide.image"
          type="button"
          :aria-label="`Show ${slide.title}`"
          :class="['h-2.5 rounded-full transition-all', activeHeroIndex === index ? 'w-10 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70']"
          @click="setHeroSlide(index)" />
      </div>
    </div>

    <div class="mx-auto mt-4 grid max-w-screen-2xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <NuxtLink
        v-for="tile in shopTiles"
        :key="tile.label"
        :to="tile.search ? localePath(`/?q=${encodeURIComponent(tile.search)}`) : localePath(`/?category=${encodeURIComponent(tile.category)}`)"
        class="rounded-[1.5rem] bg-black/5 p-5 text-center text-sm font-black tracking-wide transition hover:bg-black hover:text-white dark:bg-white/10 dark:hover:bg-white dark:hover:text-black">
        {{ tile.label }}
      </NuxtLink>
    </div>
  </section>

  <div class="flex items-center pl-3 lg:pl-5">
    <ButtonSortBy />
    <ButtonSelectCategory />
  </div>
  <div v-if="!productsEmpty" class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-3 lg:gap-5 p-3 lg:p-5">
    <ProductCard :products="products" />
    <ProductsSkeleton v-if="(!products.length || isLoading) && !productsEmpty" />
    <br ref="tailEl" />
  </div>
  <ProductsEmpty v-else />
</template>
