import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import { toWebP } from '@/lib/imageUtils'
import type { PagedResult, Product, ProductList, ProductImage, ProductQueryParams } from '@/types'

interface RawVariant {
  id: string
  size: string
  color: string | null
  sku: string
  stock_quantity: number
}

interface RawImage {
  id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
}

interface RawProduct {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  price: number
  discount_price: number | null
  brand: string | null
  is_active: boolean
  is_featured: boolean
  sales_count: number
  created_at: string
  categories: { name: string } | null
  product_images: RawImage[]
  product_variants: RawVariant[]
}

const SELECT = `
  *,
  categories(name),
  product_images(*),
  product_variants(*)
`

function toProductList(r: RawProduct): ProductList {
  const primary = r.product_images?.find((i) => i.is_primary) ?? r.product_images?.[0]
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: r.price,
    discountPrice: r.discount_price ?? undefined,
    brand: r.brand ?? undefined,
    isFeatured: r.is_featured,
    primaryImageUrl: primary?.url,
    categoryName: r.categories?.name ?? '',
    totalStock: r.product_variants?.reduce((s, v) => s + v.stock_quantity, 0) ?? 0,
    averageRating: 0,
    salesCount: r.sales_count,
  }
}

function toProduct(r: RawProduct): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? undefined,
    price: r.price,
    discountPrice: r.discount_price ?? undefined,
    brand: r.brand ?? undefined,
    isActive: r.is_active,
    isFeatured: r.is_featured,
    salesCount: r.sales_count,
    categoryId: r.category_id,
    categoryName: r.categories?.name ?? '',
    images: (r.product_images ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text ?? undefined,
        isPrimary: img.is_primary,
        displayOrder: img.display_order,
      })),
    variants: (r.product_variants ?? []).map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color ?? undefined,
      sku: v.sku,
      stockQuantity: v.stock_quantity,
      priceAdjustment: 0,
    })),
    averageRating: 0,
    reviewCount: 0,
    totalStock: r.product_variants?.reduce((s, v) => s + v.stock_quantity, 0) ?? 0,
    createdAt: r.created_at,
  }
}

export const productService = {
  getAll: async (params?: ProductQueryParams): Promise<PagedResult<ProductList>> => {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 12
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let q = supabase.from('products').select(SELECT, { count: 'exact' })

    if (params?.search) q = q.ilike('name', `%${params.search}%`)
    if (params?.categoryId) q = q.eq('category_id', params.categoryId)
    if (params?.minPrice !== undefined) q = q.gte('price', params.minPrice)
    if (params?.maxPrice !== undefined) q = q.lte('price', params.maxPrice)
    if (params?.featured) q = q.eq('is_featured', true)

    switch (params?.sortBy) {
      case 'price_asc': q = q.order('price', { ascending: true }); break
      case 'price_desc': q = q.order('price', { ascending: false }); break
      case 'sales': q = q.order('sales_count', { ascending: false }); break
      default: q = q.order('created_at', { ascending: false })
    }

    const { data, error, count } = await q.range(from, to)
    if (error) throw error

    const totalCount = count ?? 0
    const totalPages = Math.ceil(totalCount / pageSize)
    return {
      items: (data as unknown as RawProduct[]).map(toProductList),
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  },

  getFeatured: async (count = 8): Promise<ProductList[]> => {
    const { data, error } = await supabase
      .from('products')
      .select(SELECT)
      .eq('is_featured', true)
      .order('sales_count', { ascending: false })
      .limit(count)
    if (error) throw error
    return (data as unknown as RawProduct[]).map(toProductList)
  },

  getById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select(SELECT)
      .eq('id', id)
      .single()
    if (error) throw error
    return toProduct(data as unknown as RawProduct)
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select(SELECT)
      .eq('slug', slug)
      .single()
    if (error) throw error
    return toProduct(data as unknown as RawProduct)
  },

  getLowStock: async (threshold = 5): Promise<ProductList[]> => {
    const { data, error } = await supabase
      .from('products')
      .select(SELECT)
      .order('name')
    if (error) throw error
    return (data as unknown as RawProduct[])
      .filter((p) => (p.product_variants ?? []).some((v) => v.stock_quantity <= threshold))
      .map(toProductList)
  },

  create: async (payload: {
    name: string
    description?: string
    price: number
    discountPrice?: number
    brand?: string
    categoryId: string
    isActive: boolean
    isFeatured: boolean
    variants: Array<{ size: string; color?: string; sku: string; stockQuantity: number }>
  }): Promise<Product> => {
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        category_id: payload.categoryId,
        name: payload.name,
        slug: slugify(payload.name),
        description: payload.description ?? null,
        price: payload.price,
        discount_price: payload.discountPrice ?? null,
        brand: payload.brand ?? null,
        is_active: payload.isActive,
        is_featured: payload.isFeatured,
      })
      .select('id')
      .single()
    if (error) throw error

    if (payload.variants.length > 0) {
      const { error: varErr } = await supabase.from('product_variants').insert(
        payload.variants.map((v) => ({
          product_id: product.id,
          size: v.size,
          color: v.color ?? null,
          sku: v.sku,
          stock_quantity: v.stockQuantity,
        })),
      )
      if (varErr) throw varErr
    }

    return productService.getById(product.id)
  },

  update: async (
    id: string,
    payload: {
      name?: string
      description?: string
      price?: number
      discountPrice?: number
      brand?: string
      categoryId?: string
      isActive?: boolean
      isFeatured?: boolean
      variants?: Array<{ id?: string; size: string; color?: string; sku: string; stockQuantity: number }>
    },
  ): Promise<Product> => {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (payload.name !== undefined) { updates.name = payload.name; updates.slug = slugify(payload.name) }
    if (payload.description !== undefined) updates.description = payload.description || null
    if (payload.price !== undefined) updates.price = payload.price
    if ('discountPrice' in payload) updates.discount_price = payload.discountPrice ?? null
    if (payload.brand !== undefined) updates.brand = payload.brand || null
    if (payload.categoryId !== undefined) updates.category_id = payload.categoryId
    if (payload.isActive !== undefined) updates.is_active = payload.isActive
    if (payload.isFeatured !== undefined) updates.is_featured = payload.isFeatured

    const { error } = await supabase.from('products').update(updates).eq('id', id)
    if (error) throw error

    if (payload.variants !== undefined) {
      await supabase.from('product_variants').delete().eq('product_id', id)
      if (payload.variants.length > 0) {
        const { error: varErr } = await supabase.from('product_variants').insert(
          payload.variants.map((v) => ({
            product_id: id,
            size: v.size,
            color: v.color ?? null,
            sku: v.sku,
            stock_quantity: v.stockQuantity,
          })),
        )
        if (varErr) throw varErr
      }
    }

    return productService.getById(id)
  },

  delete: async (id: string): Promise<void> => {
    // Busca URLs das imagens para limpar o storage após deletar o registro
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', id)

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error

    if (images?.length) {
      const paths = images
        .map((img) => img.url.split('/product-images/')[1])
        .filter(Boolean)
      if (paths.length) {
        await supabase.storage.from('product-images').remove(paths)
      }
    }
  },

  uploadImage: async (productId: string, file: File, isPrimary = false): Promise<ProductImage> => {
    const blob = await toWebP(file)
    const path = `${productId}/${crypto.randomUUID()}.webp`

    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(path, blob, { contentType: 'image/webp' })
    if (uploadErr) throw uploadErr

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
    }

    const { data, error: dbErr } = await supabase
      .from('product_images')
      .insert({ product_id: productId, url: publicUrl, is_primary: isPrimary, display_order: 0 })
      .select()
      .single()
    if (dbErr) throw dbErr

    return {
      id: data.id,
      url: data.url,
      altText: data.alt_text ?? undefined,
      isPrimary: data.is_primary,
      displayOrder: data.display_order,
    }
  },

  deleteImage: async (imageId: string): Promise<void> => {
    const { data: img } = await supabase
      .from('product_images')
      .select('url')
      .eq('id', imageId)
      .single()

    const { error } = await supabase.from('product_images').delete().eq('id', imageId)
    if (error) throw error

    if (img?.url) {
      const storagePath = img.url.split('/product-images/')[1]
      if (storagePath) {
        await supabase.storage.from('product-images').remove([storagePath])
      }
    }
  },
}
