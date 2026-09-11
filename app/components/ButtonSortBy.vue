<!--app/components/ButtonSortBy.vue-->
<script setup>
const router = useRouter();
const route = useRoute();

defineProps({
  align: {
    type: String,
    default: 'start',
  },
});

const options = [
  { value: 'Newest', label: $t('filter.newest') },
  { value: 'Price: High to Low', label: $t('filter.price_high_low') },
  { value: 'Price: Low to High', label: $t('filter.price_low_high') },
];

const selectedSort = computed(() => {
  if (route.query.orderby === 'DESC' && route.query.fieldby === 'PRICE') return 'Price: High to Low';
  if (route.query.orderby === 'ASC' && route.query.fieldby === 'PRICE') return 'Price: Low to High';
  return 'Newest';
});

const selectedLabel = computed(() => options.find(option => option.value === selectedSort.value)?.label || options[0].label);

const isDropdownVisible = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = event => {
  event.stopPropagation();
  isDropdownVisible.value = !isDropdownVisible.value;
};

const setSort = (event, value) => {
  event.stopPropagation();
  const query = { ...route.query };

  switch (value) {
    case 'Newest':
      delete query.orderby;
      delete query.fieldby;
      break;
    case 'Price: High to Low':
      query.orderby = 'DESC';
      query.fieldby = 'PRICE';
      break;
    case 'Price: Low to High':
      query.orderby = 'ASC';
      query.fieldby = 'PRICE';
      break;
  }

  isDropdownVisible.value = false;
  router.push({ query });
};

onClickOutside(dropdownRef, () => {
  isDropdownVisible.value = false;
});
</script>

<template>
  <div ref="dropdownRef" class="relative z-30 shrink-0 text-sm font-semibold">
    <button
      type="button"
      class="box-border flex min-h-12 items-center gap-2 rounded-full px-3.5 py-2.5 transition-all active:scale-95"
      :class="
        isDropdownVisible
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'bg-[#efefef] text-black hover:bg-[#e2e2e2] dark:bg-[#262626] dark:text-white hover:dark:bg-[#333]'
      "
      :aria-expanded="isDropdownVisible"
      aria-haspopup="listbox"
      :aria-label="$t('filter.sort_by')"
      @click="toggleDropdown">
      <UIcon name="i-iconamoon-sorting-left-duotone" size="22" />
      <span class="hidden whitespace-nowrap sm:inline">{{ $t('filter.sort') }}</span>
      <span class="hidden max-w-[9.5rem] truncate text-xs font-bold sm:inline" :class="isDropdownVisible ? 'text-white/70 dark:text-black/60' : 'text-neutral-500 dark:text-neutral-400'">
        {{ selectedLabel }}
      </span>
      <span class="text-base leading-none" :class="isDropdownVisible ? 'rotate-180' : ''">▾</span>
    </button>

    <Transition name="dropdown">
      <div
        v-if="isDropdownVisible"
        class="absolute top-full z-50 mt-2 min-w-[13.5rem] overflow-hidden rounded-2xl bg-white text-base font-semibold shadow-[0_12px_40px_rgba(0,0,0,.16)] dark:bg-[#262626] dark:shadow-[0_12px_40px_rgba(0,0,0,.45)]"
        :class="align === 'end' ? 'right-0' : 'left-0'"
        role="listbox"
        @click.stop>
        <div class="border-b border-black/5 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-500 dark:border-white/10 dark:text-neutral-400">
          {{ $t('filter.sort_by') }}
        </div>
        <div class="p-2">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left transition-all duration-200 hover:bg-[#e9e9e9] hover:dark:bg-[#3c3c3c]"
            :class="selectedSort === option.value ? 'bg-black/5 dark:bg-white/10' : ''"
            role="option"
            :aria-selected="selectedSort === option.value"
            @click="setSort($event, option.value)">
            <span class="mr-3">{{ option.label }}</span>
            <UIcon v-if="selectedSort === option.value" name="i-iconamoon-check-circle-1-fill" size="22" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
