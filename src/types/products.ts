// Product-level types
export type ProductId = 'pmp' | 'askbetter' | 'nextup' | 'bidmentor' | 'hien-truong'

export interface Product {
  id: ProductId
  name: string
  tagline: string
  href: string
  badge?: string
  accentColor: string
  external?: boolean
}
