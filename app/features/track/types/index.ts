export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface TrackProduct {
  nameTk?:  string
  nameRu?:  string
  image?:   string
  imageUrl?: string
}

export interface TrackLine {
  id?:        string
  qty:        number
  unitPrice:  number | string
  options?:   Record<string, string>
  product?:   TrackProduct
}

export interface TrackedOrder {
  id:          string
  status:      OrderStatus
  total?:      number | string
  note?:       string
  createdAt:   string
  lines:       TrackLine[]
}