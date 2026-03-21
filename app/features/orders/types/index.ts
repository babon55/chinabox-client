// @/types.ts

export type Lang = 'tk' | 'ru'

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface OrderLine {
  productId: string
  name:      { tk: string; ru: string }
  image:     string
  qty:       number
  unitPrice: number
}

export interface OrderItem {
  id:       string
  customer: string
  email:    string
  phone:    string
  address:  string
  lines:    OrderLine[]
  total:    number
  status:   OrderStatus
  date:     string
  note?:    string
}