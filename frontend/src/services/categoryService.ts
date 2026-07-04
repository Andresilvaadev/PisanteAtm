import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import { toWebP } from '@/lib/imageUtils'
import type { Category } from '@/types'

interface RawCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  products: { count: number }[]
}

function map(row: RawCategory): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    isActive: row.is_active,
    displayOrder: row.display_order,
    productCount: row.products?.[0]?.count ?? 0,
  }
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('display_order')
    if (error) throw error
    return (data as unknown as RawCategory[]).map(map)
  },

  getById: async (id: string): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*, products(count)')
      .eq('id', id)
      .single()
    if (error) throw error
    return map(data as unknown as RawCategory)
  },

  create: async (dto: {
    name: string
    description?: string
    isActive?: boolean
    displayOrder?: number
  }): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: dto.name,
        slug: slugify(dto.name),
        description: dto.description ?? null,
        is_active: dto.isActive ?? true,
        display_order: dto.displayOrder ?? 0,
      })
      .select('*, products(count)')
      .single()
    if (error) throw error
    return map(data as unknown as RawCategory)
  },

  update: async (
    id: string,
    dto: { name: string; description?: string; isActive: boolean; displayOrder: number },
  ): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: dto.name,
        description: dto.description ?? null,
        is_active: dto.isActive,
        display_order: dto.displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, products(count)')
      .single()
    if (error) throw error
    return map(data as unknown as RawCategory)
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },

  uploadImage: async (categoryId: string, file: File): Promise<{ url: string }> => {
    const webpBlob = await toWebP(file)
    const path = `${categoryId}/${crypto.randomUUID()}.webp`

    const { error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(path, webpBlob, { contentType: 'image/webp', upsert: true })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('category-images')
      .getPublicUrl(path)

    const { error: dbError } = await supabase
      .from('categories')
      .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', categoryId)
    if (dbError) throw dbError

    return { url: publicUrl }
  },
}
