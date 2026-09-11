<!--app/components/AppHeader.vue-->
<script setup>
const router = useRouter();
const route = useRoute();
const searchQuery = ref((route.query.q || '').toString());
const searchResults = ref([]);
const isLoading = ref(false);
const suggestionMenu = ref(false);
const mobileMenu = ref(false);
const activeMobileSection = ref('Shop');
const searchPanelRef = ref(null);
const cartPanelRef = ref(null);
const mobileMenuRef = ref(null);
const cartModal = ref(false);
const { cart } = useCart();
const localePath = useLocalePath();

const catalogLink = category => localePath(`/?category=${encodeURIComponent(category)}`);
const searchLink = query => localePath(`/?q=${encodeURIComponent(query)}`);
const itemLink = item => (item.search ? searchLink(item.search) : catalogLink(item.category || item.label));

const shopMenus = [
  {
    label: 'MEN',
    sections: [
      { title: 'Clothing', items: [{ label: 'Shirts', category: 'Men Shirts' }, { label: 'Long Sleeve', category: 'Men Long Sleeve Shirts' }, { label: 'Short Sleeve', category: 'Men Short Sleeve Shirts' }, { label: 'T-Shirts', category: 'Men T-Shirts' }, { label: 'Shorts', category: 'Men Shorts' }, { label: 'Underwear', category: 'Men Underwear' }] },
      { title: 'Pants & Jackets', items: [{ label: 'Office Pants', category: 'Men Office Pants' }, { label: 'Cotton Pants', category: 'Men Cotton Pants' }, { label: 'Denim', category: 'Men Denim' }, { label: 'Jackets', category: 'Men Jackets' }, { label: 'Hoodies', category: 'Men Hoodies' }, { label: 'Sweaters', category: 'Men Sweaters' }] },
      { title: 'Shop By Style', items: [{ label: 'Office Wear', category: 'Men Office Wear' }, { label: 'Casual Wear', category: 'Men Casual Wear' }, { label: 'Sportswear', category: 'Men Sportswear' }, { label: 'Everyday Essentials', category: 'Men Everyday Essentials' }] },
      { title: 'Featured Brands', items: [{ label: 'U.S. POLO ASSN.', search: 'U.S. POLO ASSN. men' }, { label: 'Crocodile', search: 'Crocodile men' }, { label: 'Allen Solly', search: 'Allen Solly men' }, { label: 'Under Armour', search: 'Under Armour men' }, { label: 'Adidas', search: 'Adidas men' }] },
    ],
  },
  {
    label: 'WOMEN',
    sections: [
      { title: 'Clothing', items: [{ label: 'Blouses', category: 'Women Blouses' }, { label: 'T-Shirts', category: 'Women T-Shirts' }, { label: 'Crop Tops', category: 'Women Crop Tops' }, { label: 'Frocks', category: 'Women Frocks' }, { label: 'Skirts', category: 'Women Skirts' }] },
      { title: 'Bottoms & Layers', items: [{ label: 'Pants', category: 'Women Pants' }, { label: 'Shorts', category: 'Women Shorts' }, { label: 'Denim', category: 'Women Denim' }, { label: 'Jackets', category: 'Women Jackets' }, { label: 'Hoodies', category: 'Women Hoodies' }, { label: 'Sweaters', category: 'Women Sweaters' }] },
      { title: 'Shop By Style', items: [{ label: 'Office Wear', category: 'Women Office Wear' }, { label: 'Casual', category: 'Women Casual' }, { label: 'Party / Occasion', category: 'Women Party Occasion' }, { label: 'Activewear', category: 'Women Activewear' }] },
      { title: 'Featured Brands', items: [{ label: 'Allen Solly', search: 'Allen Solly women' }, { label: 'Puma', search: 'Puma women' }, { label: 'Adidas', search: 'Adidas women' }, { label: 'Under Armour', search: 'Under Armour women' }, { label: 'Amanthe', search: 'Amanthe women' }] },
    ],
  },
  {
    label: 'KIDS',
    sections: [
      { title: 'Shop By Age', items: [{ label: 'Baby', category: 'Baby' }, { label: '0-2 Years', category: 'Kids 0-2 Years' }, { label: '3-5 Years', category: 'Kids 3-5 Years' }, { label: '6-8 Years', category: 'Kids 6-8 Years' }, { label: '9-12 Years', category: 'Kids 9-12 Years' }, { label: 'Teens', category: 'Teens' }] },
      { title: 'Shop By Product', items: [{ label: 'T-Shirts', category: 'Kids T-Shirts' }, { label: 'Shirts', category: 'Kids Shirts' }, { label: 'Frocks', category: 'Kids Frocks' }, { label: 'Skirts', category: 'Kids Skirts' }, { label: 'Shorts', category: 'Kids Shorts' }, { label: 'Pants', category: 'Kids Pants' }, { label: 'Denim', category: 'Kids Denim' }, { label: 'Jackets', category: 'Kids Jackets' }, { label: 'Underwear', category: 'Kids Underwear' }] },
      { title: 'Shop For', items: [{ label: 'Boys', category: 'Boys' }, { label: 'Girls', category: 'Girls' }, { label: 'Unisex', category: 'Kids Unisex' }] },
      { title: 'Featured', items: [{ label: 'New Kids Arrivals', category: 'New Kids Arrivals' }, { label: 'Best Sellers', category: 'Kids Best Sellers' }, { label: 'School / Everyday', category: 'Kids School Everyday' }, { label: 'Activewear', category: 'Kids Activewear' }] },
    ],
  },
  {
    label: 'ACCESSORIES',
    sections: [
      { title: 'Bags & Leather', items: [{ label: 'Handbags', category: 'Handbags' }, { label: 'Wallets', category: 'Wallets' }] },
      { title: "Men's Accessories", items: [{ label: 'Belts', category: 'Belts' }, { label: 'Ties', category: 'Ties' }, { label: 'Cufflinks', category: 'Cufflinks' }, { label: 'Hats', category: 'Hats' }] },
      { title: 'Formal', items: [{ label: 'Suits', category: 'Suits' }, { label: 'Ties', category: 'Ties' }, { label: 'Cufflinks', category: 'Cufflinks' }] },
      { title: 'Other', items: [{ label: 'Other Accessories', category: 'Other Accessories' }] },
    ],
  },
  {
    label: 'FOOTWEAR',
    sections: [
      { title: 'By Type', items: [{ label: 'Shoes', category: 'Shoes' }, { label: 'Sandals', category: 'Sandals' }, { label: 'Slippers', category: 'Slippers' }, { label: 'Slides', category: 'Slides' }] },
      { title: 'By Customer', items: [{ label: 'Men', category: 'Men Footwear' }, { label: 'Women', category: 'Women Footwear' }, { label: 'Kids', category: 'Kids Footwear' }] },
      { title: 'By Style', items: [{ label: 'Casual', category: 'Casual Footwear' }, { label: 'Formal', category: 'Formal Footwear' }, { label: 'Sports', category: 'Sports Footwear' }, { label: 'Everyday', category: 'Everyday Footwear' }] },
      { title: 'Featured Brands', items: [{ label: 'Adidas', search: 'Adidas shoes' }, { label: 'Puma', search: 'Puma shoes' }, { label: 'Under Armour', search: 'Under Armour shoes' }, { label: 'Skechers', search: 'Skechers shoes' }, { label: 'ALDO', search: 'ALDO shoes' }] },
    ],
  },
];

const brandItems = ['Allen Solly', 'Adidas', 'Under Armour', 'Puma', 'ALDO', 'U.S. POLO ASSN.', 'Amanthe', 'Crocodile', 'Skechers', 'Titan', 'Miniso', 'Waves'];
const mobileSections = ['Shop', 'Brands', 'New Arrivals', 'Sale'];

const search = () => {
  router.push({ path: localePath('/'), query: { ...route.query, q: searchQuery.value || undefined } });
  suggestionMenu.value = false;
  mobileMenu.value = false;
};

async function fetch() {
  try {
    const response = await $fetch('/api/search', {
      query: { search: searchQuery.value },
    });
    searchResults.value = response.products.nodes;
  } catch {
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetch);

const throttledFetch = useDebounceFn(async () => {
  await fetch();
}, 300);

watch(
  () => searchQuery.value,
  () => {
    isLoading.value = true;
    throttledFetch();
  }
);

const clearSearch = () => {
  suggestionMenu.value = false;
  searchQuery.value = '';
  router.push({ query: { ...route.query, q: undefined } });
};

onClickOutside(searchPanelRef, () => {
  suggestionMenu.value = false;
});

onClickOutside(cartPanelRef, () => {
  cartModal.value = false;
});

onClickOutside(mobileMenuRef, () => {
  mobileMenu.value = false;
});

const totalQuantity = computed(() => cart.value.reduce((s, i) => s + (i.quantity || 0), 0));
</script>

<template>
  <div class="fixed z-40 flex h-[72px] w-full flex-row items-center bg-white/90 px-3 backdrop-blur-sm dark:bg-black/90 dark:backdrop-blur-lg lg:h-20 lg:px-5">
    <div class="flex w-full flex-nowrap items-center gap-2">
      <button
        type="button"
        aria-label="Open menu"
        class="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-black/5 text-sm font-bold dark:bg-white/15 lg:hidden"
        @click="mobileMenu = true">
        MENU
      </button>

      <NuxtLink
        aria-label="Branded Gallery Dept. catalog"
        class="flex min-h-[52px] items-center gap-3 rounded-2xl px-2 transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/15 max-lg:min-h-12"
        :to="localePath('/')">
        <img class="h-8 w-8 rounded-lg bg-[#b31015]" src="/logo.svg" alt="Branded Gallery Dept. logo" loading="lazy" title="Branded Gallery Dept." />
        <div class="hidden leading-tight sm:block">
          <div class="text-xs font-black tracking-[0.12em] text-black dark:text-white xl:text-base">BRANDED GALLERY DEPT.</div>
        </div>
      </NuxtLink>

      <nav class="hidden items-center gap-1 lg:flex">
        <div v-for="menu in shopMenus" :key="menu.label" class="group">
          <button
            type="button"
            class="h-12 rounded-full px-3 text-xs font-black tracking-wide transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black xl:px-4">
            {{ menu.label }}
          </button>
          <div class="pointer-events-none fixed left-5 right-5 top-20 z-50 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
            <div class="mx-auto grid max-w-screen-2xl grid-cols-4 gap-6 rounded-[2rem] border border-black/10 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/95">
              <div v-for="section in menu.sections" :key="section.title">
                <h3 class="mb-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">{{ section.title }}</h3>
                <div class="grid gap-2">
                  <NuxtLink
                    v-for="item in section.items"
                    :key="`${section.title}-${item.label}`"
                    :to="itemLink(item)"
                    class="rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                    {{ item.label }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="group">
          <button
            type="button"
            class="h-12 rounded-full px-3 text-xs font-black tracking-wide transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black xl:px-4">
            BRANDS
          </button>
          <div class="pointer-events-none fixed left-5 right-5 top-20 z-50 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
            <div class="mx-auto max-w-screen-lg rounded-[2rem] border border-black/10 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/95">
              <h3 class="mb-4 text-center text-xs font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">Shop By Brand</h3>
              <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                <NuxtLink
                  v-for="brand in brandItems"
                  :key="brand"
                  :to="searchLink(brand)"
                  class="rounded-2xl bg-black/5 px-4 py-4 text-center text-sm font-black uppercase tracking-wide transition hover:bg-black hover:text-white dark:bg-white/10 dark:hover:bg-white dark:hover:text-black">
                  {{ brand }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <NuxtLink :to="catalogLink('New Arrivals')" class="h-12 rounded-full px-3 text-xs font-black tracking-wide transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black xl:px-4 flex items-center">
          NEW ARRIVALS
        </NuxtLink>
        <NuxtLink :to="catalogLink('Sale')" class="h-12 rounded-full px-3 text-xs font-black tracking-wide transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black xl:px-4 flex items-center">
          SALE
        </NuxtLink>
      </nav>

      <div class="hidden flex-shrink flex-grow flex-col text-sm font-semibold text-[#111] dark:text-[#eee] md:flex">
        <div
          :class="[
            'flex h-12 flex-grow rounded-full pl-4 pr-3 transition-all hover:bg-black/10 hover:dark:bg-white/20',
            suggestionMenu ? 'bg-black/10 dark:bg-white/20' : 'bg-black/5 dark:bg-white/15',
          ]">
          <div class="flex w-full items-center gap-4" @click="suggestionMenu = true">
            <div v-if="!suggestionMenu" class="flex text-neutral-500 dark:text-neutral-400">
              <UIcon name="i-iconamoon-search-bold" size="20" />
            </div>
            <div class="flex w-full">
              <input
                v-model="searchQuery"
                class="w-full bg-transparent py-2 outline-none placeholder:text-[#757575] placeholder:dark:text-neutral-400"
                type="text"
                @keyup.enter="search"
                :placeholder="route.query.category ? $t('search.placeholder_in_category', { category: route.query.category }) : 'Search by category, brand, style, color'" />
              <div v-if="searchQuery || suggestionMenu" class="flex cursor-pointer items-center justify-center transition-all" @click.stop="clearSearch">
                <UIcon v-if="!isLoading" class="text-black dark:text-white" name="i-iconamoon-close-circle-1-fill" size="24" />
                <UIcon v-else name="i-svg-spinners-bars-rotate-fade" size="20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <NuxtLink
        aria-label="Wishlist"
        exactActiveClass="!bg-black/10 dark:!bg-white/30"
        class="hidden min-h-12 min-w-12 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10 active:scale-95 dark:bg-white/15 dark:hover:bg-white/20 sm:flex"
        :to="localePath('/favorites')">
        <UIcon class="text-[#5f5f5f] dark:text-[#b7b7b7]" name="i-iconamoon-heart-fill" size="26" />
      </NuxtLink>

      <button
        type="button"
        aria-label="Account"
        title="Account"
        class="hidden h-12 items-center justify-center rounded-full bg-black/5 px-4 text-sm font-bold transition hover:bg-black hover:text-white dark:bg-white/15 dark:hover:bg-white dark:hover:text-black xl:flex">
        Account
      </button>

      <button
        class="relative flex min-h-12 min-w-12 cursor-pointer items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10 active:scale-95 dark:bg-white/15 dark:hover:bg-white/20"
        @mouseup="cartModal = !cartModal">
        <UIcon class="text-[#5f5f5f] dark:text-[#b7b7b7]" name="i-iconamoon-shopping-bag-fill" size="26" />
        <span v-if="totalQuantity" class="absolute right-1 top-1 flex h-[18px] w-[18px]">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-alizarin-crimson-400 opacity-75"></span>
          <span class="relative inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-alizarin-crimson-700 text-[10px] font-semibold text-white shadow">
            {{ totalQuantity }}
          </span>
        </span>
      </button>
    </div>
  </div>

  <div v-if="mobileMenu" class="fixed inset-0 z-50 lg:hidden">
    <div class="h-full w-full bg-black/30 backdrop-blur-lg"></div>
    <aside ref="mobileMenuRef" class="fixed bottom-0 left-0 top-0 w-full max-w-sm overflow-auto rounded-r-[2rem] bg-white p-4 shadow-2xl dark:bg-black">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <div class="text-base font-black tracking-[0.12em]">BRANDED GALLERY DEPT.</div>
        </div>
        <button type="button" class="rounded-full bg-black/5 px-4 py-2 text-sm font-bold dark:bg-white/15" @click="mobileMenu = false">Close</button>
      </div>

      <div class="mb-4 rounded-2xl bg-black/5 p-3 dark:bg-white/15">
        <div class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Search</div>
        <div class="flex items-center gap-2">
          <input
            v-model="searchQuery"
            class="w-full bg-transparent py-2 text-sm font-semibold outline-none"
            type="text"
            placeholder="Search brands, products, styles"
            @keyup.enter="search" />
          <button type="button" class="rounded-full bg-black px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-black" @click="search">Go</button>
        </div>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-2">
        <button
          v-for="section in mobileSections"
          :key="section"
          type="button"
          :class="[
            'rounded-2xl px-3 py-3 text-sm font-black uppercase tracking-wide transition',
            activeMobileSection === section ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-black/5 dark:bg-white/15',
          ]"
          @click="activeMobileSection = section">
          {{ section }}
        </button>
      </div>

      <div v-if="activeMobileSection === 'Shop'" class="grid gap-3">
        <details v-for="menu in shopMenus" :key="`mobile-${menu.label}`" class="rounded-2xl bg-black/5 p-4 dark:bg-white/15">
          <summary class="cursor-pointer text-sm font-black tracking-wide">{{ menu.label }}</summary>
          <div class="mt-4 grid gap-4">
            <div v-for="section in menu.sections" :key="`mobile-${menu.label}-${section.title}`">
              <h3 class="mb-2 text-xs font-black uppercase tracking-[0.2em] text-neutral-500">{{ section.title }}</h3>
              <div class="grid gap-1">
                <NuxtLink
                  v-for="item in section.items"
                  :key="`mobile-${menu.label}-${section.title}-${item.label}`"
                  :to="itemLink(item)"
                  class="rounded-xl px-3 py-2 text-sm font-semibold"
                  @click="mobileMenu = false">
                  {{ item.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </details>
      </div>

      <div v-else-if="activeMobileSection === 'Brands'" class="grid grid-cols-2 gap-2">
        <NuxtLink
          v-for="brand in brandItems"
          :key="`mobile-brand-${brand}`"
          :to="searchLink(brand)"
          class="rounded-2xl bg-black/5 px-4 py-4 text-center text-sm font-black uppercase tracking-wide dark:bg-white/15"
          @click="mobileMenu = false">
          {{ brand }}
        </NuxtLink>
      </div>

      <div v-else class="grid gap-2">
        <NuxtLink
          :to="catalogLink(activeMobileSection)"
          class="rounded-2xl bg-black px-4 py-4 text-center text-sm font-black uppercase tracking-wide text-white dark:bg-white dark:text-black"
          @click="mobileMenu = false">
          View {{ activeMobileSection }}
        </NuxtLink>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-2">
        <NuxtLink :to="localePath('/favorites')" class="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm font-bold dark:bg-white/15" @click="mobileMenu = false">Wishlist</NuxtLink>
        <button type="button" class="rounded-2xl bg-black/5 px-4 py-3 text-sm font-bold dark:bg-white/15" @click="cartModal = true; mobileMenu = false">Cart</button>
      </div>
    </aside>
  </div>

  <div
    v-if="suggestionMenu"
    ref="searchPanelRef"
    class="fixed left-0 right-0 top-[72px] z-50 w-full bg-white/85 backdrop-blur-sm dark:bg-black/85 dark:backdrop-blur-lg lg:top-20 lg:rounded-b-3xl">
    <div class="max-h-[calc(100vh-72px)] overflow-auto lg:max-h-[calc(100vh-80px)]">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-80">
        <div class="bg-black/10 dark:bg-white/20 flex rounded-full w-12 h-12 items-center justify-center skeleton">
          <UIcon class="text-white dark:text-black" name="i-svg-spinners-8-dots-rotate" size="26" />
        </div>
      </div>
      <!-- Empty State -->
      <div v-else-if="!searchResults.length" class="w-full items-center flex flex-col justify-center text-center p-8">
        <div class="w-28 h-28 bg-black/10 dark:bg-white/20 rounded-full items-center justify-center flex">
          <UIcon name="i-iconamoon-search-bold" class="w-16 h-16 dark:text-white" />
        </div>
        <div class="font-semibold text-3xl my-6">
          {{ $t('search.no_results_for_query') }}
          <strong>{{ searchQuery }}</strong>
        </div>
        <div class="text-sm text-center mb-5 max-w-md">
          {{ $t('search.no_results_suggestion') }}
        </div>
      </div>
      <!-- Results State-->
      <div v-else class="mx-auto p-3 lg:p-4 max-w-screen-2xl">
        <h2 v-if="!searchQuery" class="text-2xl font-bold tracking-tight">{{ $t('search.new_products') }}</h2>
        <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-5 mt-3 lg:mt-5">
          <NuxtLink
            @click="suggestionMenu = false"
            :to="localePath(`/product/${product.slug}-${product.sku.split('-')[0]}`)"
            v-for="(product, i) in searchResults"
            :key="i"
            class="group select-none">
            <div class="cursor-pointer transition ease-[ease] duration-300">
              <div class="relative pb-[133%] dark:shadow-[0_8px_24px_rgba(0,0,0,.5)] rounded-2xl overflow-hidden">
                <NuxtImg
                  :alt="product.name"
                  loading="lazy"
                  :title="product.name"
                  :src="product.galleryImages.nodes[0].sourceUrl"
                  class="absolute h-full w-full dark:bg-neutral-800 bg-neutral-200 object-cover" />
                <NuxtImg
                  :alt="product.name"
                  loading="lazy"
                  :title="product.name"
                  :src="product.image.sourceUrl"
                  class="absolute h-full w-full dark:bg-neutral-800 bg-neutral-200 object-cover transition-opacity duration-300 group-hover:opacity-0" />
              </div>
              <div class="grid gap-0.5 pt-3 pb-4 px-1.5 text-sm font-semibold">
                <ProductPrice :sale-price="product.salePrice" :regular-price="product.regularPrice" variant="card" />
                <div>{{ product.name }}</div>
                <div class="font-normal text-[#5f5f5f] dark:text-[#a3a3a3]">
                  {{ product.allPaStyle.nodes[0].name }}
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
      <div v-if="searchQuery && !isLoading && searchResults.length" class="flex items-center justify-center border-t border-black/10 dark:border-white/20 p-4">
        <button
          @click="search"
          class="bg-black/15 dark:bg-white/15 hover:bg-black/10 hover:dark:bg-white/20 px-4 py-2 rounded-full active:scale-95 tracking-wide text-sm transition">
          {{ $t('search.view_all_results') }}
        </button>
      </div>
    </div>
  </div>
  <div v-if="suggestionMenu || cartModal" :class="['fixed inset-0 ', cartModal ? 'z-40' : 'z-30']">
    <div class="w-full h-full bg-black/30 backdrop-blur-lg"></div>
  </div>
  <button
    v-if="cartModal"
    class="hover:bg-white/65 dark:hover:bg-white/10 transition shadow-2xl mt-3 lg:mt-4 mx-3 lg:mx-5 items-center justify-center min-w-12 min-h-12 rounded-[2rem] right-0 fixed flex z-50 bg-white/85 dark:bg-black/30 dark:border dark:border-white/10 cart-button-bezel backdrop-blur-lg"
    @click="cartModal = false">
    <UIcon class="text-[#5f5f5f] dark:text-[#b7b7b7]" name="i-iconamoon-close" size="26" />
  </button>
  <Transition name="dropdown">
    <div v-if="cartModal" ref="cartPanelRef">
      <Cart />
    </div>
  </Transition>
</template>

<style lang="postcss">
::-webkit-scrollbar {
  @apply w-0 h-0 bg-transparent;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-black/15 dark:bg-white/15 rounded-full border-solid border-white dark:border-black;
  border-width: 5px;
}
</style>
