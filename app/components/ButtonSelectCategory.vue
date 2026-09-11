<!--app/components/ButtonSelectCategory.vue-->
<script setup>
const categoriesData = ref([]);
const loaded = ref(false);

onMounted(async () => {
  try {
    const response = await $fetch('/api/categories');
    categoriesData.value = (response.productCategories?.nodes ?? []).filter(category => category.products?.nodes?.length);
  } catch {
    categoriesData.value = [];
  } finally {
    loaded.value = true;
  }
});

const categories = computed(() => categoriesData.value);
</script>

<template>
  <div v-if="!loaded" class="ml-2 flex min-w-0 flex-1 gap-2 overflow-hidden lg:ml-4">
    <div v-for="i in 6" :key="i" class="h-12 min-w-28 rounded-full bg-neutral-200 dark:bg-white/10 skeleton"></div>
  </div>
  <CarouselCategories v-else-if="categories.length" :categories="categories" />
</template>
