import type { Lang, CartTranslations } from '../types'

const translations: Record<Lang, CartTranslations> = {
  tk: {
    title:             'Sebedim',
    empty:             'Sebet boş',
    emptyDesc:         'Heniz hiç zat goşmadyňyz. Harytlara göz aýlaň!',
    shopNow:           'Harytlara Git',
    item:              'haryt',
    items:             'haryt',
    remove:            'Aýyr',
    saveForLater:      'Soňa sakla',
    color:             'Reňk',
    size:              'Ölçeg',
    seller:            'Satyjy',
    inStock:           'Stokda bar',
    outOfStock:        'Stokda ýok',
    orderSummary:      'Sargyt Jemi',
    subtotal:          'Ara jemi',
    discount:          'Arzanladyş',
    shipping:          'Eltip beriş',
    shippingFree:      'Mugt',
    total:             'Jemi',
    checkout:          'Tölemäge Git',
    continueShopping:  'Söwda dowam et',
    promoCode:         'Promo kod',
    promoPlaceholder:  'Promo kody giriziň',
    promoApply:        'Ulan',
    clearCart:         'Sebedi arassala',
    estimatedDelivery: 'Takmynan eltip beriş: 7–14 gün',
  },
  ru: {
    title:             'Корзина',
    empty:             'Корзина пуста',
    emptyDesc:         'Вы ещё ничего не добавили. Посмотрите товары!',
    shopNow:           'Перейти к товарам',
    item:              'товар',
    items:             'товара',
    remove:            'Удалить',
    saveForLater:      'Сохранить',
    color:             'Цвет',
    size:              'Размер',
    seller:            'Продавец',
    inStock:           'В наличии',
    outOfStock:        'Нет в наличии',
    orderSummary:      'Итого по заказу',
    subtotal:          'Подытог',
    discount:          'Скидка',
    shipping:          'Доставка',
    shippingFree:      'Бесплатно',
    total:             'Итого',
    checkout:          'Оформить заказ',
    continueShopping:  'Продолжить покупки',
    promoCode:         'Промокод',
    promoPlaceholder:  'Введите промокод',
    promoApply:        'Применить',
    clearCart:         'Очистить корзину',
    estimatedDelivery: 'Ориентировочная доставка: 7–14 дней',
  },
}

export function useCart(lang: Ref<Lang>) {
  const t = computed<CartTranslations>(() => translations[lang.value])

  function formatPrice(amount: number): string {
    return `$${amount.toFixed(2)}`
  }

  function discountPercent(price: number, oldPrice: number): number {
    return Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  return { t, formatPrice, discountPercent }
}