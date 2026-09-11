export default defineNuxtPlugin({
  enforce: 'pre',
  setup() {
    const colorMode = useColorMode();
    colorMode.preference = 'light';

    if (import.meta.client) {
      const root = document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
      try {
        localStorage.setItem('bgd-color-mode', 'light');
      } catch {
        /* ignore */
      }
    }
  },
});
