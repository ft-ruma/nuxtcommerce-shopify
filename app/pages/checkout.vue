<!--app/pages/checkout.vue-->
<script setup>
const { name } = useAppConfig().site;
const url = useRequestURL();
const localePath = useLocalePath();
const { cart, increment, decrement } = useCart();
const { userDetails, checkoutStatus, handleCheckout, order, totalQuantity, cartTotalLabel } = useCheckout();

const canonical = `${url.origin}${url.pathname}`;

useSeoMeta({
  title: 'Checkout',
  ogTitle: 'Checkout',
  description: `Checkout on ${name}.`,
  ogDescription: `Checkout on ${name}.`,
  ogUrl: canonical,
  canonical,
  robots: 'noindex, nofollow',
});

const itemTotal = item => {
  const node = item.variation.node;
  const regular = parseFloat(String(node.regularPrice)) || 0;
  const sale = parseFloat(String(node.salePrice)) || 0;
  const unit = sale > 0 && sale < regular ? sale : regular || sale;
  return unit * (item.quantity ?? 1);
};

const formatRs = value => `Rs ${Number(value).toFixed(2)}`;
</script>

<template>
  <div class="mx-auto max-w-screen-2xl px-3 py-6 lg:px-5 lg:py-10">
    <div v-if="order?.orderNumber && !cart.length" class="mx-auto max-w-lg rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm lg:p-10">
      <div class="flex flex-col items-center text-center">
        <div class="mb-3 flex rounded-full bg-green-500/15 p-3">
          <UIcon name="i-iconamoon-check-circle-1-fill" size="52" class="text-[#23a26d]" />
        </div>
        <h1 class="text-3xl font-black">{{ $t('checkout.pay.success') }}</h1>
        <p class="mt-2 text-sm font-semibold text-neutral-500">{{ $t('checkout.pay.processed') }}</p>
      </div>
      <div class="mt-8 grid gap-3 rounded-2xl bg-neutral-100 p-5 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-neutral-500">{{ $t('checkout.pay.total') }}</span>
          <span class="text-lg font-black">{{ order.total }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-neutral-500">{{ $t('checkout.pay.order_number') }}</span>
          <span class="font-bold">#{{ order.orderNumber }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-neutral-500">{{ $t('checkout.pay.date') }}</span>
          <span class="font-bold">{{ useDateFormat(order.date, 'MMMM DD, YYYY') }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-neutral-500">{{ $t('checkout.pay.payment_method') }}</span>
          <span class="font-bold">{{ order.paymentMethodTitle }}</span>
        </div>
      </div>
      <NuxtLink :to="localePath('/')" class="mt-8 flex h-12 items-center justify-center rounded-full bg-black text-sm font-black uppercase tracking-wide text-white">
        {{ $t('checkout.continue_shopping') }}
      </NuxtLink>
    </div>

    <div v-else-if="!cart.length" class="mx-auto max-w-lg py-16 text-center">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-alizarin-crimson-500/15">
        <UIcon name="i-iconamoon-shopping-bag-fill" size="40" class="text-alizarin-crimson-600" />
      </div>
      <h1 class="text-3xl font-black">{{ $t('cart.empty') }}</h1>
      <p class="mt-2 text-sm font-semibold text-neutral-500">{{ $t('cart.notting_added') }}</p>
      <NuxtLink :to="localePath('/')" class="mt-8 inline-flex h-12 items-center rounded-full bg-black px-6 text-sm font-black uppercase tracking-wide text-white">
        {{ $t('checkout.empty_cta') }}
      </NuxtLink>
    </div>

    <div v-else>
      <NuxtLink :to="localePath('/')" class="text-xs font-black uppercase tracking-[0.28em] text-neutral-500 transition hover:text-black">Home</NuxtLink>
      <h1 class="mt-2 text-4xl font-black tracking-tight">{{ $t('checkout.title') }}</h1>

      <form class="mt-8 grid items-start gap-6 lg:grid-cols-12" @submit.prevent="handleCheckout">
        <div class="grid gap-6 lg:col-span-7">
          <section class="rounded-[1.75rem] border border-black/10 bg-white p-5 lg:p-7">
            <h2 class="text-lg font-black">{{ $t('checkout.contact') }}</h2>
            <div class="billing mt-4 grid gap-3">
              <input v-model="userDetails.email" required name="email" type="email" :placeholder="$t('checkout.form.email')" />
              <input v-model="userDetails.phone" required name="phone" type="tel" :placeholder="$t('checkout.form.phone')" />
            </div>
          </section>

          <section class="rounded-[1.75rem] border border-black/10 bg-white p-5 lg:p-7">
            <h2 class="text-lg font-black">{{ $t('checkout.shipping_address') }}</h2>
            <div class="billing mt-4 grid grid-cols-2 gap-3">
              <input v-model="userDetails.firstName" required name="first-name" type="text" :placeholder="$t('checkout.form.first_name')" />
              <input v-model="userDetails.lastName" required name="last-name" type="text" :placeholder="$t('checkout.form.last_name')" />
              <input v-model="userDetails.city" required name="city" type="text" class="col-span-2 sm:col-span-1" :placeholder="$t('checkout.form.city')" />
              <textarea v-model="userDetails.address1" required name="address" rows="3" class="col-span-2" :placeholder="$t('checkout.form.address')"></textarea>
            </div>
          </section>

          <section class="rounded-[1.75rem] border border-black/10 bg-white p-5 lg:p-7">
            <h2 class="text-lg font-black">{{ $t('checkout.payment') }}</h2>
            <label class="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-neutral-100 px-4 py-3">
              <span class="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-neutral-800">
                <span class="h-2 w-2 rounded-full bg-neutral-800"></span>
              </span>
              <span class="text-sm font-bold">{{ $t('checkout.payment_cod') }}</span>
            </label>
          </section>
        </div>

        <aside class="lg:sticky lg:top-24 lg:col-span-5">
          <div class="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm lg:p-7">
            <h2 class="text-lg font-black">{{ $t('checkout.order_summary') }}</h2>
            <div class="mt-4 grid gap-3">
              <div v-for="item in cart" :key="item.key" class="flex gap-3 rounded-2xl bg-neutral-100 p-3">
                <NuxtImg :src="item.variation.node.image.sourceUrl" :alt="item.product.node.name" class="h-24 w-20 rounded-xl object-cover bg-neutral-200" />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-bold">{{ item.product.node.name }}</div>
                  <div class="mt-0.5 text-xs font-semibold text-neutral-500">
                    {{ $t('product.size') }}: {{ item.variation.attributes.map(attr => attr.value.toUpperCase()).join(', ') }}
                  </div>
                  <div class="mt-2 flex items-center justify-between gap-2">
                    <div class="flex items-center rounded-full bg-white px-1.5 py-1">
                      <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5" @click="decrement(item.variation.node.databaseId)">
                        <UIcon :name="item.quantity > 1 ? 'i-iconamoon-sign-minus' : 'i-iconamoon-trash-light'" size="14" />
                      </button>
                      <span class="w-6 text-center text-sm font-bold">{{ item.quantity }}</span>
                      <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5" @click="increment(item.variation.node.databaseId)">
                        <UIcon name="i-iconamoon-sign-plus" size="14" />
                      </button>
                    </div>
                    <div class="text-sm font-black">{{ formatRs(itemTotal(item)) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-5 grid gap-2 border-t border-black/10 pt-4 text-sm font-semibold">
              <div class="flex justify-between">
                <span class="text-neutral-500">{{ $t('checkout.subtotal') }}</span>
                <span>{{ cartTotalLabel }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-500">{{ $t('checkout.shipping') }}</span>
                <span>{{ $t('checkout.shipping_free') }}</span>
              </div>
              <div class="flex justify-between text-base font-black">
                <span>{{ $t('checkout.pay.total') }}</span>
                <span>{{ cartTotalLabel }}</span>
              </div>
            </div>

            <button
              type="submit"
              :disabled="checkoutStatus !== 'order'"
              class="pay-button-bezel relative mt-6 flex h-12 w-full items-center justify-center rounded-xl text-lg font-semibold text-white">
              <span v-if="checkoutStatus === 'order'">{{ $t('checkout.place_order') }} · {{ cartTotalLabel }}</span>
              <UIcon v-else name="i-svg-spinners-90-ring-with-bg" size="22" />
            </button>
            <p class="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-neutral-400">
              <UIcon name="i-iconamoon-lock-fill" size="16" />
              {{ $t('checkout.pay.secure', { method: 'Branded Gallery Dept.' }) }}
            </p>
          </div>
        </aside>
      </form>
    </div>
  </div>
</template>

<style lang="postcss">
.billing input,
.billing textarea {
  @apply block w-full rounded-2xl border-2 border-transparent bg-neutral-100 px-4 py-3 text-sm font-semibold leading-6 text-black shadow-none transition placeholder:text-neutral-400 hover:border-black focus-visible:border-black focus-visible:outline-none;
}
.billing textarea {
  resize: none;
}
.pay-button-bezel {
  box-shadow: 0 0 0 var(--button-outline, 0px) rgba(92, 222, 131, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
    0 1px 1px 0 rgba(0, 0, 0, 0.3);
  @apply bg-[#23a26d] outline-none transition duration-200;
  &:hover {
    @apply brightness-110;
  }
  &:active {
    --button-outline: 4px;
  }
  &:disabled {
    @apply opacity-70;
  }
}
</style>
