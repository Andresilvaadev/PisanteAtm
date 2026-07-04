// ─── Auth ──────────────────────────────────────────────────────────────────
export interface UserToken {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: UserToken
}

// ─── Category ──────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  isActive: boolean
  displayOrder: number
  productCount: number
}

// ─── Product ───────────────────────────────────────────────────────────────
export interface ProductImage {
  id: string
  url: string
  altText?: string
  isPrimary: boolean
  displayOrder: number
  color?: string
}

export interface ProductVariant {
  id: string
  size: string
  color?: string
  sku: string
  stockQuantity: number
  priceAdjustment?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  discountPrice?: number
  brand?: string
  isActive: boolean
  isFeatured: boolean
  salesCount: number
  categoryId: string
  categoryName: string
  images: ProductImage[]
  variants: ProductVariant[]
  averageRating: number
  reviewCount: number
  totalStock: number
  createdAt: string
}

export interface ProductList {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number
  brand?: string
  isFeatured: boolean
  primaryImageUrl?: string
  categoryName: string
  totalStock: number
  averageRating: number
  salesCount: number
}

// ─── Cart ──────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string
  productId: string
  productName: string
  productImageUrl?: string
  unitPrice: number
  variantId?: string
  size?: string
  color?: string
  stockQuantity: number
  quantity: number
  subtotal: number
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
  itemCount: number
}

// ─── Order ─────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: string
  productId: string
  productName: string
  variantSize?: string
  variantColor?: string
  productImageUrl?: string
  unitPrice: number
  quantity: number
  total: number
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded'

export interface Order {
  id: string
  orderNumber: string
  status: number
  statusLabel: OrderStatus
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  shippingRecipient: string
  shippingZipCode: string
  shippingStreet: string
  shippingNumber: string
  shippingComplement?: string
  shippingNeighborhood: string
  shippingCity: string
  shippingState: string
  trackingCode?: string
  items: OrderItem[]
  createdAt: string
  shippedAt?: string
  deliveredAt?: string
}

// ─── Address ───────────────────────────────────────────────────────────────
export interface Address {
  id: string
  label: string
  recipientName: string
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  isDefault: boolean
}

// ─── Pagination ────────────────────────────────────────────────────────────
export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  lowStockProducts: number
  totalCustomers: number
  topProducts: TopProduct[]
  recentOrders: RecentOrder[]
}

export interface TopProduct {
  id: string
  name: string
  salesCount: number
  revenue: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

// ─── Query params ──────────────────────────────────────────────────────────
export interface ProductQueryParams {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price_asc' | 'price_desc' | 'sales' | 'newest'
  featured?: boolean
}
