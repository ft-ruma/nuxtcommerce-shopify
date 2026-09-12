<!--app/components/ButtonWishlist.vue-->
<script setup>
const props = defineProps({
  product: Object,
  variant: {
    type: String,
    default: 'default',
  },
});

const { wishlist, toggleWishlist } = useWishlist();

const isWishlisted = computed(() => {
  const id = Number(props.product?.databaseId);
  if (!id) return false;
  return wishlist.value.some(item => Number(item.databaseId) === id);
});

const saveProduct = event => {
  event.preventDefault();
  event.stopPropagation();
  if (!props.product?.databaseId) return;
  toggleWishlist(props.product);
};
</script>

<template>
  <button
    v-if="variant === 'card'"
    type="button"
    class="absolute right-2.5 top-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition duration-200 hover:scale-105 active:scale-95"
    :class="isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100'"
    :aria-pressed="isWishlisted"
    :aria-label="isWishlisted ? $t('favorites.remove') : $t('favorites.add')"
    :title="isWishlisted ? $t('favorites.remove') : $t('favorites.add')"
    @click="saveProduct">
    <UIcon
      :name="isWishlisted ? 'i-iconamoon-heart-fill' : 'i-iconamoon-heart'"
      size="22"
      :class="isWishlisted ? 'text-alizarin-crimson-500 pulse-heart' : 'text-neutral-800'" />
  </button>
  <button v-else type="button" class="active:scale-95 transition" :aria-pressed="isWishlisted" @click="saveProduct">
    <div
      :class="[
        'w-12 h-12 rounded-full ml-3 flex justify-center items-center',
        isWishlisted ? 'bg-alizarin-crimson-100 dark:bg-alizarin-crimson-950' : 'bg-neutral-200 dark:bg-neutral-800',
      ]">
      <UIcon
        :name="isWishlisted ? 'i-iconamoon-heart-fill' : 'i-iconamoon-heart'"
        size="26"
        :class="isWishlisted ? 'text-alizarin-crimson-400 dark:text-alizarin-crimson-700 pulse-heart' : 'text-neutral-900 dark:text-neutral-200'" />
    </div>
  </button>
</template>

<style lang="postcss">
@keyframes animateHeart {
  0% {
    transform: scale(0.9);
  }
  5% {
    transform: scale(1.1);
  }
  10% {
    transform: scale(0.9);
  }
  15% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(0.9);
  }
}

.pulse-heart {
  animation: animateHeart 1.2s infinite;
}
</style>
