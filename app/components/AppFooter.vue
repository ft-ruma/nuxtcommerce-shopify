<!--app/components/AppFooter.vue-->
<script setup>
const config = useRuntimeConfig();
const { locale, locales, setLocale } = useI18n();

const isOpen = ref(false);
const dropdownRef = ref();

onClickOutside(dropdownRef, () => (isOpen.value = false));

const currentLocale = computed(() => locales.value.find(l => l.code === locale.value));

const chooseLocale = code => {
  setLocale(code);
  isOpen.value = false;
};
</script>

<template>
  <footer class="my-5 flex items-center justify-between gap-3 px-5 text-[13px] font-semibold text-neutral-500">
    <div class="truncate">
      <a class="transition-all hover:text-black" href="https://github.com/zackha/nuxtcommerce" target="_blank">
        NuxtCommerce v{{ config.public.version }}
      </a>
      —
      {{ $t('footer.developed_by_author') }}
      <a class="transition-all hover:text-black" href="https://zackha.com" target="_blank">Sefa Bulak</a>
    </div>

    <div v-if="locales?.length > 1" class="relative flex-none" ref="dropdownRef">
      <UTooltip :text="$t('footer.change_language')" :open-delay="800">
        <button
          type="button"
          @click="isOpen = !isOpen"
          :aria-expanded="isOpen"
          aria-haspopup="listbox"
          class="flex h-8 items-center gap-1.5 rounded-lg bg-neutral-100 p-2 text-neutral-700 transition-all hover:bg-neutral-200 hover:text-black active:scale-95">
          {{ currentLocale.name }}
        </button>
      </UTooltip>

      <Transition name="dropdown">
        <div
          v-if="isOpen"
          class="absolute bottom-full right-0 z-10 mb-3 rounded-2xl bg-white text-base font-semibold shadow-[0_0_8px_rgba(0,0,0,.1)]"
          role="listbox">
          <ul class="m-2 w-44 text-sm">
            <li
              v-for="item in locales"
              :key="item.code || item.name"
              @click="chooseLocale(item.code)"
              class="cursor-pointer rounded-[10px] px-3 py-2 text-black transition-all duration-300 hover:bg-[#e9e9e9]"
              role="option"
              :aria-selected="locale === item.code"
              tabindex="0"
              @keydown.enter.prevent="chooseLocale(item.code)">
              <div class="flex items-center justify-between">
                <span class="mr-1 truncate">{{ item.name }}</span>
                <UIcon v-if="locale === item.code" name="i-iconamoon-check-circle-1-fill" size="20" />
              </div>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </footer>
</template>
