<!--app/components/BrandMark.vue-->
<script setup>
defineProps({
  brand: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <span class="flex max-w-full items-center justify-center text-center text-neutral-900 group-hover:text-white">
    <img
      v-if="brand.logo"
      :src="brand.logo"
      :alt="`${brand.name} logo`"
      class="brand-logo object-contain group-hover:invert"
      :class="compact ? 'h-10 max-w-[8rem]' : 'h-12 max-w-[9.5rem] sm:h-14'" />

    <span v-else-if="brand.wordmark === 'aldo'" class="brand-aldo" :class="compact ? 'brand-aldo--compact' : ''">ALDO</span>

    <span v-else-if="brand.wordmark === 'uspolo'" class="flex flex-col items-center" :class="compact ? 'brand-uspolo--compact' : ''">
      <span class="brand-uspolo-name">U.S. POLO ASSN.</span>
      <span class="brand-uspolo-since">SINCE 1890</span>
    </span>

    <span v-else class="px-1 text-[13px] font-black uppercase leading-tight tracking-[0.16em] sm:text-sm">
      {{ brand.name }}
    </span>
  </span>
</template>

<style scoped>
.brand-logo {
  width: auto;
  filter: none;
}
.brand-aldo {
  font-family: 'Montserrat', 'Century Gothic', Futura, sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.34em;
  line-height: 1;
  padding-left: 0.34em;
  text-transform: uppercase;
}
.brand-aldo--compact {
  font-size: 14px;
}
.brand-uspolo-name {
  font-family: 'Libre Bodoni', 'Times New Roman', Times, serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.05em;
  line-height: 1.15;
  text-transform: uppercase;
}
.brand-uspolo-since {
  margin-top: 0.45rem;
  font-family: 'Libre Bodoni', 'Times New Roman', Times, serif;
  font-size: 8.5px;
  font-weight: 400;
  letter-spacing: 0.32em;
  padding-left: 0.32em;
  text-transform: uppercase;
}
.brand-uspolo--compact .brand-uspolo-name {
  font-size: 12px;
}
.brand-uspolo--compact .brand-uspolo-since {
  font-size: 7.5px;
  margin-top: 0.35rem;
}
</style>
