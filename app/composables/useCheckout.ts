import { push } from 'notivue';

const defaultUserDetails = (): CheckoutUserDetails => ({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  city: '',
  address1: '',
});

export const useCheckout = () => {
  const { cart } = useCart();
  const { locale } = useI18n();
  const order = useState<CheckoutOrder | null>('order', () => null);
  const userDetails = useState<CheckoutUserDetails>('userDetails', defaultUserDetails);
  const checkoutStatus = ref<CheckoutStatus>('order');

  // If the shopper presses "back" on the Shopify checkout page, re-enable the pay button.
  useEventListener('pageshow', (event: PageTransitionEvent) => {
    if (event.persisted) checkoutStatus.value = 'order';
  });

  // Creates a Shopify cart with the form details prefilled, then redirects to Shopify's secure checkout.
  // The local cart is kept until Shopify confirms the order (see useCart).
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
    handleCheckout,
  };
};
