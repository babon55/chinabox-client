export type OptionType = 'select' | 'number' | 'text' | 'color' | 'size'

export interface ProductOption {
  id:       string
  nameTk:   string
  nameRu:   string
  type:     OptionType
  unit?:    string
  values:   string[]
  required: boolean
}

export interface Category {
  id:     string
  nameTk: string
  nameRu: string
}

export interface Product {
  id:             string
  nameTk:         string
  nameRu:         string
  descriptionTk?: string | null
  descriptionRu?: string | null
  image:          string
  imageUrl?:      string | null
  imageUrls:      string[]
  price:          number
  weightG?:       number | null
  stock:          number
  sold:           number
  status:         string
  categoryId:     string
  category:       Category
  options:        ProductOption[]
  markup:         number
}

export type SelectedOptions = Record<string, string>