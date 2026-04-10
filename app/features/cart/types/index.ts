export type Lang         = 'tk' | 'ru'
export type DeliveryType = 'simple' | 'fast'

export interface CartItem {
  id:              string
  name:            Record<Lang, string>
  image:           string
  price:           number
  oldPrice?:       number
  quantity:        number
  color?:          string
  size?:           string
  seller:          string
  inStock:         boolean
  options?:        Record<string, string>
  optionsDisplay?: { name: string; value: string }[]
}

export interface CartSummary {
  subtotal:     number
  discount:     number
  deliveryCost: number
  homeDelivery: boolean
  total:        number
}

export interface CartTranslations {
  title:              string
  empty:              string
  emptyDesc:          string
  shopNow:            string
  item:               string
  items:              string
  remove:             string
  saveForLater:       string
  color:              string
  size:               string
  seller:             string
  inStock:            string
  outOfStock:         string
  orderSummary:       string
  subtotal:           string
  discount:           string
  shipping:           string
  shippingFree:       string
  deliverySimple:     string
  deliveryFast:       string
  deliveryHome:       string
  deliveryWayPrice:   string
  total:              string
  checkout:           string
  continueShopping:   string
  promoCode:          string
  promoPlaceholder:   string
  promoApply:         string
  clearCart:          string
  estimatedDelivery:  string
}