<!--app/components/Cart.vue-->
<script setup>
const { cart, increment, decrement } = useCart();
const { order, cartTotalLabel } = useCheckout();
const localePath = useLocalePath();
const cartModal = useState('cartModal', () => false);

const goToCheckout = () => {
  cartModal.value = false;
};
</script>

<template>
  <div
    class="select-none mx-3 lg:mx-5 shadow-2xl mt-20 rounded-[2rem] right-0 fixed flex z-50 bg-white/85 dark:bg-black/85 dark:border dark:border-white/10 cart-button-bezel backdrop-blur-lg overflow-hidden">
    <Transition name="fade" mode="out-in">
      <PaymentSuccessful v-if="order?.orderNumber && !cart.length" />
      <div v-else-if="cart.length" class="flex w-full h-full max-md:flex-col max-md:max-h-[calc(100vh-92px)] max-md:overflow-auto">
        <div class="w-[calc(100vw-24px)] sm:w-full md:w-80 relative">
          <div class="md:absolute h-full w-full overflow-auto">
            <div
              v-for="product in cart.slice().reverse()"
              :key="product.key"
              class="flex bg-black/5 dark:bg-white/10 m-3 p-3 gap-3 rounded-3xl items-center group relative max-md:pr-9">
              <NuxtImg :src="product.variation.node.image.sourceUrl" class="w-24 h-28 object-cover shadow-md rounded-2xl" />
              <div class="flex-1 gap-1 flex flex-col">
                <div class="font-medium text-sm line-clamp-2 overflow-hidden text-ellipsis">{{ product.product.node.name }}</div>
                <ProductPrice :sale-price="product.variation.node.salePrice" :regular-price="product.variation.node.regularPrice" :quantity="product.quantity" variant="cart" />
                <div class="text-xs flex gap-2 font-medium text-neutral-600 dark:text-neutral-300">
                  <div>
                    {{ $t('product.size') }}: {{ product.variation.attributes.map(attr => attr.value.toUpperCase()).join(', ') }} • {{ $t('product.quantity') }}:
                    {{ product.quantity }}
                  </div>
                </div>
              </div>
              <div
                class="absolute md:opacity-0 group-hover:opacity-100 top-2 right-2 md:-top-1 md:-right-1 transition space-y-0.5 flex flex-col p-0.5 dark:bg-white/10 bg-black/10 backdrop-blur border dark:border-white/5 border-black/5 items-center justify-center rounded-full">
                <div class="dark:bg-white/10 bg-white/50 dark:hover:bg-white/30 hover:bg-white/100 transition-all rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                  <UIcon size="14" name="i-iconamoon-sign-plus" class="text-black dark:text-white cursor-pointer" @click="increment(product.variation.node.databaseId)" />
                </div>
                <span class="text-center text-sm">{{ product.quantity }}</span>
                <div class="dark:bg-white/10 bg-white/50 dark:hover:bg-white/30 hover:bg-white/100 transition-all rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                  <UIcon
                    size="14"
                    :name="product.quantity > 1 ? 'i-iconamoon-sign-minus' : 'i-iconamoon-trash-light'"
                    class="text-black dark:text-white cursor-pointer"
                    @click="decrement(product.variation.node.databaseId)" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="md:w-80 h-full bg-black/5 dark:bg-white/10 my-3 mr-3 p-4 max-md:ml-3 rounded-3xl flex flex-col justify-between">
          <div>
            <div class="text-xl font-bold px-2 mb-3">{{ $t('checkout.title') }}</div>
            <div class="flex justify-between px-2 text-sm font-semibold">
              <span class="text-neutral-500">{{ $t('checkout.pay.total') }}</span>
              <span class="text-lg font-black">{{ cartTotalLabel }}</span>
            </div>
          </div>
          <NuxtLink
            :to="localePath('/checkout')"
            class="pay-button-bezel mt-5 flex h-12 w-full items-center justify-center rounded-xl text-lg font-semibold text-white"
            @click="goToCheckout">
            {{ $t('cart.checkout') }}
          </NuxtLink>
        </div>
      </div>
      <EmptyCart v-else />
    </Transition>
  </div>
</template>

<style lang="postcss">
.cart-button-bezel {
  box-shadow: inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}
.pay-button-bezel {
  box-shadow: 0 0 0 var(--button-outline, 0px) rgba(92, 222, 131, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
    0 1px 1px 0 rgba(0, 0, 0, 0.3);
  @apply bg-[#23a26d] outline-none transition duration-200;
  &:hover {
    @apply brightness-110;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 250ms;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
