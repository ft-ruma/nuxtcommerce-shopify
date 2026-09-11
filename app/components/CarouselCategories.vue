<!--app/components/CarouselCategories.vue-->
<script setup>
const router = useRouter();
const route = useRoute();

defineProps({
  categories: Array,
});

const cardsSlider = ref(null);
const showPrev = ref(false);
const showNext = ref(true);
const isDragging = ref(false);
const dragThreshold = 10;
let startX, scrollLeft;

const setCategory = category => {
  if (!isDragging.value && (route.query.category || '') !== category) {
    router.push({ query: { ...route.query, category: category || undefined } });
  }
};

const initializeDrag = e => {
  isDragging.value = false;
  startX = e.pageX - cardsSlider.value.getBoundingClientRect().left;
  scrollLeft = cardsSlider.value.scrollLeft;
  document.addEventListener('mousemove', handleDragging);
  document.addEventListener('mouseup', endDrag);
};

const handleDragging = e => {
  const xPos = e.pageX - cardsSlider.value.getBoundingClientRect().left;
  const walk = (xPos - startX) * 1.5;
  cardsSlider.value.scrollLeft = scrollLeft - walk;
  isDragging.value = Math.abs(walk) > dragThreshold;
};

const endDrag = () => {
  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', endDrag);
};

const updateButtonVisibility = () => {
  const { scrollLeft, scrollWidth, clientWidth } = cardsSlider.value;
  showPrev.value = scrollLeft > 16;
  showNext.value = scrollLeft < scrollWidth - clientWidth - 16;
};

onMounted(() => {
  cardsSlider.value.addEventListener('mousedown', initializeDrag);
  updateButtonVisibility();
});

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', endDrag);
});
</script>

<template>
  <div class="slider-container ml-2 min-w-0 flex-1 lg:ml-4">
    <div v-if="showPrev" class="slider-btn prev-btn"></div>
    <div class="slider-wrapper">
      <div ref="cardsSlider" class="cards-slider" @scroll="updateButtonVisibility">
        <button
          type="button"
          @click="setCategory('')"
          :class="['card ml-0 transition', !route.query.category ? 'selected' : 'chip']">
          <div class="px-3.5">{{ $t('filter.all_categories') }}</div>
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          @click="setCategory(category.name)"
          :class="['card transition', route.query.category === category.name ? 'selected' : 'chip']">
          <img
            v-if="category.image?.sourceUrl"
            :alt="category.name"
            loading="lazy"
            :src="category.image.sourceUrl"
            class="h-[38px] w-[38px] rounded-full object-cover" />
          <div
            v-else
            class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-black/10 text-xs font-black dark:bg-white/15">
            {{ category.name.charAt(0) }}
          </div>
          <div class="px-3.5">{{ category.name }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.chip {
  @apply bg-neutral-100 text-black hover:bg-neutral-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20;
}

.selected {
  @apply bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200;
}

.slider-container {
  @apply relative flex items-center overflow-hidden;
}

.slider-wrapper {
  @apply relative w-full overflow-hidden;
}

.cards-slider {
  @apply flex w-full cursor-grab gap-2 overflow-auto pr-3 lg:gap-3 lg:pr-4;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.cards-slider::-webkit-scrollbar {
  display: none;
}

.cards-slider:active {
  cursor: grabbing;
}

.card {
  @apply box-border flex min-w-max cursor-pointer select-none items-center rounded-full border-0 p-1.5 text-sm font-semibold transition-all;
  &:active {
    @apply scale-95 cursor-grab;
  }
}

.slider-btn {
  @apply absolute top-0 z-10 flex h-full w-14 cursor-pointer select-none items-center justify-center;
}

.prev-btn {
  @apply left-0 bg-gradient-to-r from-white dark:from-black;
}

.slider-wrapper::before,
.slider-wrapper::after {
  @apply absolute top-0 z-10 h-full w-2 lg:w-4;
  content: '';
  pointer-events: none;
}

.slider-wrapper::before {
  @apply left-0 bg-gradient-to-r from-white dark:from-black;
}
</style>
