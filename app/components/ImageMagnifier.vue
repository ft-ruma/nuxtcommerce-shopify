<!--app/components/ImageMagnifier.vue-->
<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  zoom: {
    type: Number,
    default: 2.4,
  },
});

const root = ref(null);
const active = ref(false);
const lens = ref({
  x: 0,
  y: 0,
  size: 176,
  bgX: 0,
  bgY: 0,
  bgW: 0,
  bgH: 0,
});

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const move = event => {
  if (!canHover() || !root.value) return;
  const rect = root.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const size = Math.min(lens.value.size, rect.width, rect.height);
  const half = size / 2;
  const zoomW = rect.width * props.zoom;
  const zoomH = rect.height * props.zoom;

  lens.value = {
    size,
    x: Math.max(0, Math.min(x - half, rect.width - size)),
    y: Math.max(0, Math.min(y - half, rect.height - size)),
    bgW: zoomW,
    bgH: zoomH,
    bgX: (x / rect.width) * zoomW - half,
    bgY: (y / rect.height) * zoomH - half,
  };
  active.value = true;
};

const leave = () => {
  active.value = false;
};
</script>

<template>
  <div
    ref="root"
    class="image-magnifier relative h-full min-h-[320px] w-full overflow-hidden bg-neutral-200 lg:min-h-full"
    :class="active ? 'cursor-none' : 'cursor-zoom-in'"
    @mousemove="move"
    @mouseenter="move"
    @mouseleave="leave">
    <img :src="src" :alt="alt" class="h-full w-full object-cover select-none" draggable="false" />
    <div
      v-show="active"
      class="pointer-events-none absolute z-10 rounded-full border-2 border-white shadow-[0_8px_28px_rgba(0,0,0,.28)] ring-1 ring-black/10"
      :style="{
        width: `${lens.size}px`,
        height: `${lens.size}px`,
        left: `${lens.x}px`,
        top: `${lens.y}px`,
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${lens.bgW}px ${lens.bgH}px`,
        backgroundPosition: `-${lens.bgX}px -${lens.bgY}px`,
      }" />
    <span class="pointer-events-none absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-neutral-800 shadow backdrop-blur">
      <UIcon name="i-iconamoon-search-bold" size="16" />
    </span>
  </div>
</template>
