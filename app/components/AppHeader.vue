<!--app/components/AppHeader.vue-->
<script setup>
import { brandItems } from '#shared/brands';

const router = useRouter();
const route = useRoute();
const searchQuery = ref((route.query.q || '').toString());
const searchResults = ref([]);
const isLoading = ref(false);
const suggestionMenu = ref(false);
const mobileMenu = ref(false);
const activeMobileSection = ref('Shop');
const searchPanelRef = ref(null);
const searchInputRef = ref(null);
const cartPanelRef = ref(null);
const mobileMenuRef = ref(null);
const navRef = ref(null);
const cartModal = useState('cartModal', () => false);
const activeMenu = ref('');
const isListening = ref(false);
const voiceSupported = ref(false);
const voiceError = ref('');
let menuCloseTimer;
let recognition;
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

const mobileSections = ['Shop', 'Brands', 'New Arrivals', 'Sale'];

const search = () => {
  stopVoiceSearch();
  router.push({ path: localePath('/'), query: { ...route.query, q: searchQuery.value || undefined } });
  suggestionMenu.value = false;
  mobileMenu.value = false;
};

const openSearch = () => {
  suggestionMenu.value = true;
  voiceError.value = '';
  nextTick(() => searchInputRef.value?.focus());
};

const closeSearch = () => {
  suggestionMenu.value = false;
  stopVoiceSearch();
};

const getSpeechRecognition = () => {
  if (!import.meta.client) return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const stopVoiceSearch = () => {
  try {
    recognition?.stop();
  } catch {
    /* already stopped */
  }
  isListening.value = false;
};

const startVoiceSearch = () => {
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) {
    voiceError.value = 'Voice search is not supported in this browser.';
    return;
  }

  stopVoiceSearch();
  voiceError.value = '';
  recognition = new SpeechRecognition();
  recognition.lang = navigator.language || 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening.value = true;
  };

  recognition.onresult = event => {
    const transcript = Array.from(event.results)
      .map(result => result[0]?.transcript || '')
      .join(' ')
      .trim();
    if (transcript) searchQuery.value = transcript;
  };

  recognition.onerror = event => {
    isListening.value = false;
    if (event.error === 'not-allowed') voiceError.value = 'Allow microphone access to search by voice.';
    else if (event.error !== 'aborted' && event.error !== 'no-speech') voiceError.value = 'Voice search could not start. Try typing instead.';
  };

  recognition.onend = () => {
    isListening.value = false;
  };

  try {
    recognition.start();
  } catch {
    voiceError.value = 'Voice search could not start. Try typing instead.';
  }
};

const toggleVoiceSearch = () => {
  if (isListening.value) stopVoiceSearch();
  else startVoiceSearch();
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

onMounted(() => {
  voiceSupported.value = !!getSpeechRecognition();
  window.addEventListener('keydown', onGlobalSearchShortcut);
});

const throttledFetch = useDebounceFn(async () => {
  await fetch();
}, 300);

watch(
  () => searchQuery.value,
  () => {
    if (!suggestionMenu.value) return;
    isLoading.value = true;
    throttledFetch();
  }
);

watch(suggestionMenu, open => {
  if (open) {
    isLoading.value = true;
    fetch();
    nextTick(() => searchInputRef.value?.focus());
  } else {
    stopVoiceSearch();
  }
});

const onSearchKeydown = event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSearch();
  }
};

const onGlobalSearchShortcut = event => {
  if (suggestionMenu.value || cartModal.value || mobileMenu.value) return;
  const target = event.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
  if (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
    event.preventDefault();
    openSearch();
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  nextTick(() => searchInputRef.value?.focus());
};

const openMenu = label => {
  window.clearTimeout(menuCloseTimer);
  activeMenu.value = label;
};

const closeMenu = () => {
  window.clearTimeout(menuCloseTimer);
  menuCloseTimer = window.setTimeout(() => {
    activeMenu.value = '';
  }, 200);
};

const toggleMenu = label => {
  window.clearTimeout(menuCloseTimer);
  activeMenu.value = activeMenu.value === label ? '' : label;
};

onClickOutside(cartPanelRef, () => {
  cartModal.value = false;
});

onClickOutside(mobileMenuRef, () => {
  mobileMenu.value = false;
});

onClickOutside(navRef, () => {
  activeMenu.value = '';
});

watch(
  () => route.fullPath,
  () => {
    activeMenu.value = '';
  }
);

onBeforeUnmount(() => {
  window.clearTimeout(menuCloseTimer);
  window.removeEventListener('keydown', onGlobalSearchShortcut);
  stopVoiceSearch();
});

const totalQuantity = computed(() => cart.value.reduce((s, i) => s + (i.quantity || 0), 0));
</script>

<template>
  <div class="fixed z-40 flex h-[72px] w-full flex-row items-center bg-white px-3 shadow-[0_1px_0_rgba(0,0,0,.06)] lg:h-20 lg:px-5">
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
        <div class="hidden leading-none sm:block">
          <div class="text-xs font-black tracking-[0.12em] text-black xl:text-sm">BRANDED GALLERY</div>
          <div class="text-xs font-black tracking-[0.12em] text-black xl:text-sm">DEPT.</div>
        </div>
      </NuxtLink>

      <nav ref="navRef" class="hidden items-center gap-1 lg:flex">
        <div
          v-for="menu in shopMenus"
          :key="menu.label"
          class="relative"
          @mouseenter="openMenu(menu.label)"
          @mouseleave="closeMenu">
          <button
            type="button"
            class="relative z-[60] h-12 rounded-full px-3 text-xs font-black tracking-wide transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black xl:px-4"
            :class="activeMenu === menu.label ? 'bg-black text-white dark:bg-white dark:text-black' : ''"
            :aria-expanded="activeMenu === menu.label"
            @click="toggleMenu(menu.label)">
            {{ menu.label }}
          </button>
          <div
            v-show="activeMenu === menu.label"
            class="fixed inset-x-0 top-[60px] z-50 px-5 pt-5"
            @mouseenter="openMenu(menu.label)"
            @mouseleave="closeMenu">
            <div class="mx-auto grid max-h-[min(32rem,calc(100vh-8rem))] max-w-screen-2xl grid-cols-4 gap-6 overflow-y-auto overscroll-contain rounded-[2rem] border border-black/10 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/95">
              <div v-for="section in menu.sections" :key="section.title">
                <h3 class="mb-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">{{ section.title }}</h3>
                <div class="grid gap-2">
                  <NuxtLink
                    v-for="item in section.items"
                    :key="`${section.title}-${item.label}`"
                    :to="itemLink(item)"
                    class="rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    @click="activeMenu = ''">
                    {{ item.label }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative" @mouseenter="openMenu('BRANDS')" @mouseleave="closeMenu">
          <button
            type="button"
            class="relative z-[60] h-12 rounded-full px-3 text-xs font-black tracking-wide transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black xl:px-4"
            :class="activeMenu === 'BRANDS' ? 'bg-black text-white dark:bg-white dark:text-black' : ''"
            :aria-expanded="activeMenu === 'BRANDS'"
            @click="toggleMenu('BRANDS')">
            BRANDS
          </button>
          <div
            v-show="activeMenu === 'BRANDS'"
            class="fixed inset-x-0 top-[60px] z-50 px-5 pt-5"
            @mouseenter="openMenu('BRANDS')"
            @mouseleave="closeMenu">
            <div class="mx-auto max-h-[min(32rem,calc(100vh-8rem))] max-w-screen-lg overflow-y-auto overscroll-contain rounded-[2rem] border border-black/10 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/95">
              <h3 class="mb-4 text-center text-xs font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">Shop By Brand</h3>
              <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                <NuxtLink
                  v-for="brand in brandItems"
                  :key="brand.name"
                  :to="searchLink(brand.name)"
                  :aria-label="`Shop ${brand.name}`"
                  class="group flex min-h-[112px] items-center justify-center rounded-2xl bg-neutral-100 px-5 py-5 text-neutral-900 transition hover:bg-black hover:text-white"
                  @click="activeMenu = ''">
                  <BrandMark :brand="brand" />
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

      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          title="Search"
          class="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10 active:scale-95 dark:bg-white/15 dark:hover:bg-white/20"
          :class="suggestionMenu ? 'bg-black/10 dark:bg-white/20' : ''"
          @click="openSearch">
          <UIcon class="text-[#5f5f5f] dark:text-[#b7b7b7]" name="i-iconamoon-search-bold" size="26" />
        </button>

        <NuxtLink
          aria-label="Wishlist"
          exactActiveClass="!bg-black/10 dark:!bg-white/30"
          class="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10 active:scale-95 dark:bg-white/15 dark:hover:bg-white/20"
          :to="localePath('/favorites')">
          <UIcon class="text-[#5f5f5f] dark:text-[#b7b7b7]" name="i-iconamoon-heart-fill" size="26" />
        </NuxtLink>

        <button
          type="button"
          aria-label="Account"
          title="Account"
          class="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10 active:scale-95 dark:bg-white/15 dark:hover:bg-white/20">
          <UIcon class="text-[#5f5f5f] dark:text-[#b7b7b7]" name="i-iconamoon-profile-circle-fill" size="26" />
        </button>

        <button
          type="button"
          aria-label="Cart"
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
  </div>

  <div v-if="mobileMenu" class="fixed inset-0 z-50 lg:hidden">
    <div class="h-full w-full bg-black/30 backdrop-blur-lg"></div>
    <aside ref="mobileMenuRef" class="fixed bottom-0 left-0 top-0 w-full max-w-sm overflow-auto rounded-r-[2rem] bg-white p-4 shadow-2xl dark:bg-black">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <div class="text-sm font-black tracking-[0.12em]">BRANDED GALLERY</div>
          <div class="text-sm font-black tracking-[0.12em]">DEPT.</div>
        </div>
        <button type="button" class="rounded-full bg-black/5 px-4 py-2 text-sm font-bold dark:bg-white/15" @click="mobileMenu = false">Close</button>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-black/5 px-4 py-3 text-sm font-black uppercase tracking-wide dark:bg-white/15"
          @click="mobileMenu = false; openSearch()">
          <UIcon name="i-iconamoon-search-bold" size="18" />
          Search
        </button>
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
          :key="`mobile-brand-${brand.name}`"
          :to="searchLink(brand.name)"
          :aria-label="`Shop ${brand.name}`"
          class="group flex min-h-[100px] items-center justify-center rounded-2xl bg-neutral-100 px-4 py-4 text-neutral-900"
          @click="mobileMenu = false">
          <BrandMark :brand="brand" compact />
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

  <div v-if="suggestionMenu" class="fixed inset-0 z-50 flex items-start justify-center px-3 pt-24 lg:pt-28">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="closeSearch"></div>
    <div ref="searchPanelRef" class="relative z-10 flex max-h-[min(80vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl" @keydown="onSearchKeydown">
      <div class="border-b border-black/5 p-4">
        <div class="flex items-center gap-2 rounded-full bg-black/5 px-3 py-2">
          <UIcon class="text-[#5f5f5f]" name="i-iconamoon-search-bold" size="24" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            class="w-full bg-transparent py-2 text-base font-semibold outline-none placeholder:text-neutral-400"
            type="text"
            enterkeyhint="search"
            autocomplete="off"
            :placeholder="isListening ? 'Listening… speak now' : 'Type or use voice to search'"
            @keyup.enter="search" />
          <button
            v-if="searchQuery && !isListening"
            type="button"
            aria-label="Clear search"
            class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/10"
            @click="clearSearch">
            <UIcon v-if="!isLoading" name="i-iconamoon-close-circle-1-fill" size="22" />
            <UIcon v-else name="i-svg-spinners-bars-rotate-fade" size="18" />
          </button>
          <button
            v-if="voiceSupported"
            type="button"
            :aria-label="isListening ? 'Stop voice search' : 'Search with voice'"
            :class="[
              'flex h-10 w-10 items-center justify-center rounded-full transition',
              isListening ? 'bg-[#b31015] text-white' : 'hover:bg-black/10 text-[#5f5f5f]',
            ]"
            @click="toggleVoiceSearch">
            <UIcon :name="isListening ? 'i-iconamoon-microphone-fill' : 'i-iconamoon-microphone-duotone'" size="22" />
          </button>
          <button type="button" aria-label="Close search" class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/10" @click="closeSearch">
            <UIcon name="i-iconamoon-close" size="22" />
          </button>
        </div>
        <p v-if="voiceError" class="mt-2 px-2 text-xs font-semibold text-[#b31015]">{{ voiceError }}</p>
        <p v-else class="mt-2 px-2 text-xs font-semibold text-neutral-500">
          {{ isListening ? 'Listening… say a product, brand, or category' : 'Type a search, press Enter, or tap the microphone' }}
        </p>
      </div>

      <div class="min-h-0 flex-1 overflow-auto">
        <div v-if="isLoading" class="flex h-64 items-center justify-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-black/10 skeleton">
            <UIcon name="i-svg-spinners-8-dots-rotate" size="26" />
          </div>
        </div>
        <div v-else-if="!searchResults.length" class="flex w-full flex-col items-center justify-center p-8 text-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-black/5">
            <UIcon name="i-iconamoon-search-bold" class="h-10 w-10 text-neutral-400" />
          </div>
          <div class="my-5 text-2xl font-semibold">
            {{ $t('search.no_results_for_query') }}
            <strong>{{ searchQuery }}</strong>
          </div>
          <div class="mb-2 max-w-md text-sm text-neutral-500">{{ $t('search.no_results_suggestion') }}</div>
        </div>
        <div v-else class="p-4">
          <h2 v-if="!searchQuery" class="text-xl font-bold tracking-tight">{{ $t('search.new_products') }}</h2>
          <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <NuxtLink
              v-for="(product, i) in searchResults"
              :key="i"
              :to="localePath(`/product/${product.slug}-${product.sku.split('-')[0]}`)"
              class="group select-none"
              @click="closeSearch">
              <div class="relative overflow-hidden rounded-2xl pb-[133%]">
                <NuxtImg :alt="product.name" loading="lazy" :src="product.galleryImages.nodes[0].sourceUrl" class="absolute h-full w-full bg-neutral-200 object-cover" />
                <NuxtImg :alt="product.name" loading="lazy" :src="product.image.sourceUrl" class="absolute h-full w-full bg-neutral-200 object-cover transition-opacity duration-300 group-hover:opacity-0" />
                <ButtonWishlist :product="product" variant="card" />
              </div>
              <div class="grid gap-0.5 px-1.5 pb-2 pt-3 text-sm font-semibold">
                <ProductPrice :sale-price="product.salePrice" :regular-price="product.regularPrice" variant="card" />
                <div>{{ product.name }}</div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="searchQuery && !isLoading && searchResults.length" class="flex items-center justify-center border-t border-black/10 p-4">
        <button type="button" class="rounded-full bg-black px-5 py-2 text-sm font-bold tracking-wide text-white transition hover:bg-neutral-800 active:scale-95" @click="search">
          {{ $t('search.view_all_results') }}
        </button>
      </div>
    </div>
  </div>
  <div v-if="cartModal" class="fixed inset-0 z-40">
    <div class="h-full w-full bg-black/30 backdrop-blur-lg"></div>
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
