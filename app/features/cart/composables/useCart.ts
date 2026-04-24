import { useI18n } from 'vue-i18n'
import type { CartTranslations } from '../types'

// We'll use Vue I18n globally; this composable provides cart-specific helpers
export function useCart() {
  const { t } = useI18n()

  // Type-safe wrapper for cart translations
  const cartT = computed<CartTranslations>(() => ({
    title:             t('cart.title'),
    empty:             t('cart.empty'),
    emptyDesc:         t('cart.emptyMessage'),
    shopNow:           t('cart.startShopping'),
    item:              t('cart.itemCount'),
    items:             t('cart.itemCount'),
    remove:            t('cartItem.remove'),
    saveForLater:      t('cartItem.save'),
    color:             t('cartItem.color'),
    size:              t('cartItem.size'),
    seller:            t('cartItem.seller'),
    inStock:           t('cartItem.inStock'),
    outOfStock:        t('cartItem.outOfStock'),
    orderSummary:      t('cart.orderSummary'),
    subtotal:          t('cart.subtotal'),
    discount:          t('cart.discount'),
    shipping:          t('cart.shipping'),
    shippingFree:      t('common.free'),
    total:             t('cart.total'),
    checkout:          t('cart.checkout'),
    continueShopping:  t('cart.continueShopping'),
    promoCode:         t('cart.promoCode'),
    promoPlaceholder:  t('cart.promoPlaceholder'),
    promoApply:        t('cart.promoApply'),
    clearCart:         t('cart.clearCart'),
    estimatedDelivery: t('cart.estimatedDelivery'),
    deliveryType:      t('cart.deliveryType'),
    deliverySimple:    t('cart.deliverySimple'),
    deliveryFast:      t('cart.deliveryFast'),
    deliveryHome:      t('cart.deliveryHome'),
    deliveryWayPrice:  t('cart.deliveryWayPrice'),
    days:              t('cart.days'),
  }))

  function formatPrice(amount: number): string {
    return `$${amount.toFixed(2)}`
  }

  function discountPercent(price: number, oldPrice: number): number {
    return Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  return { t: cartT, formatPrice, discountPercent }
}