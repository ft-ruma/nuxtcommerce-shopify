import { push } from 'notivue';
import { CHECKOUT_CART_KEY } from './useCart';

const defaultUserDetails = (): CheckoutUserDetails => ({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  city: '',
  address1: '',
});

const lineTotal = (item: CartItem) => {
  const node = item.variation.node;
  const regularPrice = parseFloat(String(node.regularPrice)) || 0;
  const salePrice = parseFloat(String(node.salePrice)) || 0;
  const unit = salePrice > 0 && salePrice < regularPrice ? salePrice : regularPrice || salePrice;
  return unit * (item.quantity ?? 1);
};

export const useCheckout = () => {
  const { cart, clearCart } = useCart();
  const { locale } = useI18n();
  const route = useRoute();
  const localePath = useLocalePath();
  const order = useState<CheckoutOrder | null>('order', () => null);
  const userDetails = useState<CheckoutUserDetails>('userDetails', defaultUserDetails);
  const checkoutStatus = ref<CheckoutStatus>('order');

  const totalQuantity = computed(() => cart.value.reduce((sum, item) => sum + (item.quantity || 0), 0));
  const cartTotalValue = computed(() => cart.value.reduce((sum, item) => sum + lineTotal(item), 0));
  const cartTotal = computed(() => cartTotalValue.value.toFixed(2));
  const cartTotalLabel = computed(() => `Rs ${cartTotal.value}`);

  useEventListener('pageshow', (event: PageTransitionEvent) => {
    if (event.persisted) checkoutStatus.value = 'order';
  });

  const completeLocalOrder = (orderNumber?: string) => {
    order.value = {
      total: cartTotalLabel.value,
      orderNumber: orderNumber || `BGD${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      paymentMethodTitle: 'Cash on delivery',
    };
    clearCart();
    checkoutStatus.value = 'order';
  };

  const handleCheckout = async () => {
    if (checkoutStatus.value !== 'order' || !cart.value.length) return;
    checkoutStatus.value = 'processing';

    try {
      const response = await $fetch<CheckoutResponse>('/api/checkout', {
        method: 'POST',
        body: {
          billing: { ...userDetails.value },
          lines: cart.value.map(item => ({
            merchandiseId: item.variation.node.databaseId,
            quantity: item.quantity,
          })),
          locale: locale.value,
        },
      });

      if (response.mock || !response.checkoutUrl) {
        completeLocalOrder(response.orderNumber);
        if (!String(route.path).includes('/checkout')) {
          await navigateTo(localePath('/checkout'));
        }
        return;
      }

      localStorage.setItem(CHECKOUT_CART_KEY, response.cartId);
      window.location.assign(response.checkoutUrl);
    } catch (error: any) {
      checkoutStatus.value = 'order';
      push.error(error?.data?.statusMessage || error?.statusMessage || 'Could not start checkout');
    }
  };

  return {
    order,
    userDetails,
    checkoutStatus,
    totalQuantity,
    cartTotal,
    cartTotalLabel,
    handleCheckout,
  };
};
