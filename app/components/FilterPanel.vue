<!--app/components/FilterPanel.vue-->
<script setup>
const route = useRoute();
const router = useRouter();

const SIZE_PREVIEW = 5;

const facets = ref({
  sizes: [],
  availability: [
    { label: 'In Stock', value: 'in', count: 0 },
    { label: 'Out Of Stock', value: 'out', count: 0 },
  ],
  price: { min: 0, max: 25000, currency: 'LKR', prefix: 'Rs' },
});
const loaded = ref(false);
const showAllSizes = ref(false);
const minValue = ref(0);
const maxValue = ref(25000);
const minDraft = ref('0');
const maxDraft = ref('25000.00');

const selectedSize = computed(() => (typeof route.query.size === 'string' ? route.query.size : ''));
const selectedAvailability = computed(() => (route.query.availability === 'out' ? 'out' : 'in'));
const prefix = computed(() => facets.value.price.prefix || 'Rs');
const visibleSizes = computed(() => (showAllSizes.value ? facets.value.sizes : facets.value.sizes.slice(0, SIZE_PREVIEW)));
const canToggleSizes = computed(() => facets.value.sizes.length > SIZE_PREVIEW);
const rangeMin = computed(() => Number(facets.value.price.min) || 0);
const rangeMax = computed(() => Math.max(rangeMin.value + 1, Number(facets.value.price.max) || 25000));
const minPercent = computed(() => ((minValue.value - rangeMin.value) / (rangeMax.value - rangeMin.value)) * 100);
const maxPercent = computed(() => ((maxValue.value - rangeMin.value) / (rangeMax.value - rangeMin.value)) * 100);

const formatBound = value => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const filterQuery = computed(() => ({
  search: route.query.q,
  category: route.query.category,
  size: route.query.size,
  sizeOption: route.query.sizeOption,
  availability: route.query.availability,
  minPrice: route.query.minPrice,
  maxPrice: route.query.maxPrice,
}));

const patchQuery = patch => {
  const query = { ...route.query };
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === '') delete query[key];
    else query[key] = String(value);
  }
  router.push({ query });
};

const setSize = size => {
  if (selectedSize.value === size.value) {
    patchQuery({ size: '', sizeOption: '' });
    return;
  }
  patchQuery({ size: size.value, sizeOption: size.optionName || 'Size' });
};

const setAvailability = value => {
  patchQuery({ availability: value === 'in' ? '' : value });
};

const applyPrice = () => {
  let min = Math.min(Number(minValue.value), Number(maxValue.value));
  let max = Math.max(Number(minValue.value), Number(maxValue.value));
  min = Math.min(rangeMax.value, Math.max(rangeMin.value, min));
  max = Math.min(rangeMax.value, Math.max(rangeMin.value, max));
  minValue.value = min;
  maxValue.value = max;
  minDraft.value = formatBound(min);
  maxDraft.value = formatBound(max);
  patchQuery({
    minPrice: min <= rangeMin.value ? '' : String(min),
    maxPrice: max >= rangeMax.value ? '' : String(max),
  });
};

const applyDraftPrice = () => {
  const min = Number(String(minDraft.value).replace(/[^\d.]/g, ''));
  const max = Number(String(maxDraft.value).replace(/[^\d.]/g, ''));
  if (Number.isFinite(min)) minValue.value = min;
  if (Number.isFinite(max)) maxValue.value = max;
  applyPrice();
};

const debouncedApplyPrice = useDebounceFn(applyPrice, 280);

const onMinSlide = event => {
  minValue.value = Math.min(Number(event.target.value), maxValue.value);
  minDraft.value = formatBound(minValue.value);
  debouncedApplyPrice();
};

const onMaxSlide = event => {
  maxValue.value = Math.max(Number(event.target.value), minValue.value);
  maxDraft.value = formatBound(maxValue.value);
  debouncedApplyPrice();
};

async function loadFacets() {
  try {
    const response = await $fetch('/api/filters', { query: filterQuery.value });
    facets.value = response;
    const nextMin = route.query.minPrice != null && route.query.minPrice !== '' ? Number(route.query.minPrice) : response.price.min;
    const nextMax = route.query.maxPrice != null && route.query.maxPrice !== '' ? Number(route.query.maxPrice) : response.price.max;
    minValue.value = Number.isFinite(nextMin) ? nextMin : 0;
    maxValue.value = Number.isFinite(nextMax) ? nextMax : 25000;
    minDraft.value = formatBound(minValue.value);
    maxDraft.value = formatBound(maxValue.value);
  } catch {
    facets.value = {
      sizes: [],
      availability: [
        { label: 'In Stock', value: 'in', count: 0 },
        { label: 'Out Of Stock', value: 'out', count: 0 },
      ],
      price: { min: 0, max: 25000, currency: 'LKR', prefix: 'Rs' },
    };
  } finally {
    loaded.value = true;
  }
}

watch(filterQuery, loadFacets, { immediate: true });
</script>

<template>
  <aside class="rounded-[1.75rem] border border-black/10 bg-white p-5 text-neutral-900 shadow-sm">
    <section v-if="!loaded || facets.sizes.length" class="pb-5">
      <h3 class="text-[15px] font-semibold">{{ $t('filter.size') }}</h3>
      <div v-if="!loaded" class="mt-4 grid gap-3">
        <div v-for="i in 5" :key="i" class="h-6 rounded-full bg-neutral-100 skeleton"></div>
      </div>
      <div v-else class="mt-3 grid gap-1">
        <button
          v-for="size in visibleSizes"
          :key="size.value"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-sm font-semibold"
          @click="setSize(size)">
          <span
            class="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border"
            :class="selectedSize === size.value ? 'border-neutral-800' : 'border-neutral-300'">
            <span v-if="selectedSize === size.value" class="h-2 w-2 rounded-full bg-neutral-800"></span>
          </span>
          <span class="min-w-0 flex-1 truncate">{{ size.label }}</span>
          <span class="text-neutral-400">({{ size.count }})</span>
        </button>
        <button
          v-if="canToggleSizes"
          type="button"
          class="mt-1 flex items-center gap-2 py-1.5 text-sm font-bold"
          @click="showAllSizes = !showAllSizes">
          <span class="text-base leading-none">{{ showAllSizes ? '–' : '+' }}</span>
          {{ showAllSizes ? $t('filter.show_less') : $t('filter.show_more') }}
        </button>
      </div>
    </section>

    <section class="border-t border-neutral-200 py-5">
      <h3 class="text-[15px] font-semibold">{{ $t('filter.availability') }}</h3>
      <div class="mt-3 grid gap-1">
        <button
          v-for="item in facets.availability"
          :key="item.value"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-sm font-semibold"
          @click="setAvailability(item.value)">
          <span
            class="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border"
            :class="selectedAvailability === item.value ? 'border-neutral-800' : 'border-neutral-300'">
            <span v-if="selectedAvailability === item.value" class="h-2 w-2 rounded-full bg-neutral-800"></span>
          </span>
          <span class="min-w-0 flex-1 truncate">{{ item.value === 'in' ? $t('filter.in_stock') : $t('filter.out_of_stock') }}</span>
          <span class="text-neutral-400">({{ item.count }})</span>
        </button>
      </div>
    </section>

    <section class="border-t border-neutral-200 pt-5">
      <h3 class="text-[15px] font-semibold">{{ $t('filter.price') }}</h3>
      <div class="relative mt-6 h-6">
        <div class="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-neutral-200"></div>
        <div
          class="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-neutral-700"
          :style="{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }"></div>
        <input
          class="filter-range pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
          type="range"
          :min="rangeMin"
          :max="rangeMax"
          :value="minValue"
          @input="onMinSlide" />
        <input
          class="filter-range pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
          type="range"
          :min="rangeMin"
          :max="rangeMax"
          :value="maxValue"
          @input="onMaxSlide" />
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <label class="min-w-0">
          <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">{{ $t('filter.from') }}</span>
          <span class="mt-1 flex items-center rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold">
            <span class="mr-1 text-neutral-500">{{ prefix }}</span>
            <input
              v-model="minDraft"
              class="w-full min-w-0 bg-transparent outline-none"
              inputmode="decimal"
              @change="applyDraftPrice"
              @keydown.enter.prevent="applyDraftPrice" />
          </span>
        </label>
        <label class="min-w-0">
          <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">{{ $t('filter.to') }}</span>
          <span class="mt-1 flex items-center rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold">
            <span class="mr-1 text-neutral-500">{{ prefix }}</span>
            <input
              v-model="maxDraft"
              class="w-full min-w-0 bg-transparent outline-none"
              inputmode="decimal"
              @change="applyDraftPrice"
              @keydown.enter.prevent="applyDraftPrice" />
          </span>
        </label>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.filter-range {
  pointer-events: none;
}
.filter-range::-webkit-slider-thumb {
  pointer-events: auto;
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 999px;
  background: #111;
  border: 2px solid #111;
  box-shadow: 0 0 0 3px #fff;
  cursor: pointer;
}
.filter-range::-moz-range-thumb {
  pointer-events: auto;
  height: 16px;
  width: 16px;
  border: 0;
  border-radius: 999px;
  background: #111;
  box-shadow: 0 0 0 3px #fff;
  cursor: pointer;
}
.filter-range::-webkit-slider-runnable-track {
  background: transparent;
}
.filter-range::-moz-range-track {
  background: transparent;
}
</style>
