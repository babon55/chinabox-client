export type Lang        = 'tk' | 'ru'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type DeliveryType = 'simple' | 'fast'

export interface OrderProduct {
  id:          string
  nameTk:      string
  nameRu:      string
  imageUrl?:   string
  image?:      string
  category?: {
    nameTk: string
    nameRu: string
  }
}

export interface OrderLine {
  id:        string
  qty:       number
  unitPrice: number | string
  options?:  Record<string, string>
  product?:  OrderProduct
}

export interface Order {
  id:           string
  status:       OrderStatus
  deliveryType: DeliveryType
  homeDelivery: boolean
  total:        number | string
  note?:        string
  createdAt:    string
  lines:        OrderLine[]
}

export interface OrderStats {
  label: string
  value: number | string
  icon:  string
}