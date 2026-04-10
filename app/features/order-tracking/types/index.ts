export interface OrderItem {
  id: number
  name_tm: string
  name_ru: string
  quantity: number
  price: number
  options?: {
    name_tm: string
    name_ru: string
  }[]
}

export interface OrderStatus {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  label_tm: string
  label_ru: string
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  created_at: string
  total_amount: number
  items: OrderItem[]
  note?: string
  customer_name?: string
  customer_phone?: string
  shipping_address?: string
}

export interface TrackingResponse {
  success: boolean
  data?: Order
  error?: string
}