import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, ImagePlus, X, Star } from 'lucide-react'
import type { Category, Product, ProductImage } from '@/types'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

interface VariantRow {
  id?: string
  size: string
  color: string
  sku: string
  stockQuantity: number
}

const emptyVariant = (): VariantRow => ({
  size: '',
  color: '',
  sku: '',
  stockQuantity: 0,
})

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Campos do produto
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [brand, setBrand] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()])

  // Imagens já salvas (edição)
  const [savedImages, setSavedImages] = useState<ProductImage[]>([])
  // Novas imagens a enviar
  const [newImages, setNewImages] = useState<{ file: File; preview: string; isPrimary: boolean; color: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    categoryService.getAll().then(setCategories)
    if (isEdit && id) {
      productService.getById(id).then((p: Product) => {
        setName(p.name)
        setDescription(p.description ?? '')
        setPrice(String(p.price))
        setDiscountPrice(p.discountPrice ? String(p.discountPrice) : '')
        setBrand(p.brand ?? '')
        setCategoryId(p.categoryId)
        setIsActive(p.isActive)
        setIsFeatured(p.isFeatured)
        setSavedImages(p.images ?? [])
        setVariants(
          p.variants.length > 0
            ? p.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color ?? '',
                sku: v.sku,
                stockQuantity: v.stockQuantity,
              }))
            : [emptyVariant()]
        )
        setLoading(false)
      }).catch(() => { toast.error('Produto não encontrado'); navigate('/admin/produtos') })
    }
  }, [id, isEdit, navigate])

  /* ── Variantes ── */
  const updateVariant = (i: number, field: keyof VariantRow, val: string | number) =>
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v))

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()])
  const removeVariant = (i: number) => setVariants((prev) => prev.filter((_, idx) => idx !== i))

  /* ── Imagens ── */
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newEntries = files.map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: savedImages.length === 0 && newImages.length === 0 && i === 0,
      color: '',
    }))
    setNewImages((prev) => [...prev, ...newEntries])
    e.target.value = ''
  }

  const handleUpdateImageColor = async (imgId: string, color: string | null) => {
    try {
      await productService.updateImageColor(imgId, color)
      setSavedImages((prev) => prev.map((img) => img.id === imgId ? { ...img, color: color ?? undefined } : img))
    } catch {
      toast.error('Erro ao atualizar cor da imagem')
    }
  }

  const removeNewImage = (i: number) =>
    setNewImages((prev) => prev.filter((_, idx) => idx !== i))

  const removeSavedImage = async (imgId: string) => {
    try {
      await productService.deleteImage(imgId)
      setSavedImages((prev) => prev.filter((img) => img.id !== imgId))
      toast.success('Imagem removida')
    } catch {
      toast.error('Erro ao remover imagem')
    }
  }

  const togglePrimary = (i: number) =>
    setNewImages((prev) => prev.map((img, idx) => ({ ...img, isPrimary: idx === i })))

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) { toast.error('Selecione uma categoria'); return }
    if (variants.some((v) => !v.size)) { toast.error('Preencha o tamanho em todas as variantes'); return }

    setSaving(true)
    const prefix = (name.slice(0, 4) || 'PRD').toUpperCase().replace(/\s/g, '')
    try {
      const payload = {
        name,
        description: description || undefined,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
        brand: brand || undefined,
        categoryId,
        isActive,
        isFeatured,
        variants: variants.map((v) => ({
          size: v.size,
          color: v.color || undefined,
          sku: v.sku || `${prefix}-${v.size}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          stockQuantity: Number(v.stockQuantity),
        })),
      }

      let productId = id!
      if (isEdit) {
        await productService.update(id!, payload)
        toast.success('Produto atualizado!')
      } else {
        const created = await productService.create(payload)
        productId = (created as Product).id
        toast.success('Produto criado!')
      }

      // Upload das novas imagens
      for (const img of newImages) {
        await productService.uploadImage(productId, img.file, img.isPrimary, img.color || undefined)
      }

      navigate('/admin/produtos')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  // Cores únicas dos variants (para o dropdown de cor por foto)
  const uniqueVariantColors = [...new Set(variants.filter((v) => v.color).map((v) => v.color))]

  const allImages = [
    ...savedImages.map((img) => ({ type: 'saved' as const, img })),
    ...newImages.map((img, i) => ({ type: 'new' as const, img, i })),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/produtos')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-5">

          {/* Dados básicos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Informações</h2>
            <Input
              label="Nome do produto *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tênis Air Force 1"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
                placeholder="Descreva o produto..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Nike, Adidas..." />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white"
                  required
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preços */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Preços</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Preço original (R$) *"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                required
              />
              <Input
                label="Preço promocional (R$)"
                type="number"
                min="0"
                step="0.01"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            {discountPrice && parseFloat(discountPrice) >= parseFloat(price || '0') && (
              <p className="text-xs text-red-500">O preço promocional deve ser menor que o original.</p>
            )}
          </div>

          {/* Variantes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Variantes (Tamanhos / Estoque)</h2>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <input
                      value={v.size}
                      onChange={(e) => updateVariant(i, 'size', e.target.value)}
                      placeholder="Tamanho *"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      value={v.color}
                      onChange={(e) => updateVariant(i, 'color', e.target.value)}
                      placeholder="Cor"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      value={v.sku}
                      onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                      placeholder="SKU (opcional)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={v.stockQuantity}
                      onChange={(e) => updateVariant(i, 'stockQuantity', e.target.value)}
                      placeholder="Estoque"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                  <div className="col-span-1">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="col-span-1" />
                </div>
              ))}
              <p className="text-xs text-gray-400">Tamanho obrigatório. SKU gerado automaticamente se vazio.</p>
            </div>
          </div>

          {/* Fotos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Fotos</h2>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700"
              >
                <ImagePlus className="w-4 h-4" /> Adicionar fotos
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleAddImages}
            />

            {allImages.length === 0 ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
              >
                <ImagePlus className="w-8 h-8" />
                <p className="text-sm font-medium">Clique para adicionar fotos</p>
                <p className="text-xs">JPG, PNG ou WebP — máx. 5MB cada</p>
              </button>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {savedImages.map((img) => (
                  <div key={img.id} className="group">
                    <div className="relative aspect-square">
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover rounded-xl border border-gray-200"
                      />
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSavedImage(img.id)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {uniqueVariantColors.length > 0 ? (
                      <select
                        value={img.color ?? ''}
                        onChange={(e) => handleUpdateImageColor(img.id, e.target.value || null)}
                        className="w-full mt-1 text-xs rounded-lg border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-300"
                      >
                        <option value="">Sem cor</option>
                        {uniqueVariantColors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={img.color ?? ''}
                        onChange={(e) => handleUpdateImageColor(img.id, e.target.value || null)}
                        placeholder="Cor (ex: Azul)"
                        className="w-full mt-1 text-xs rounded-lg border border-gray-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-300"
                      />
                    )}
                  </div>
                ))}
                {newImages.map((img, i) => (
                  <div key={i} className="group">
                    <div className="relative aspect-square">
                      <img
                        src={img.preview}
                        alt=""
                        className={`w-full h-full object-cover rounded-xl border-2 transition-colors ${
                          img.isPrimary ? 'border-brand-500' : 'border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePrimary(i)}
                        title="Definir como principal"
                        className={`absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 transition-colors ${
                          img.isPrimary
                            ? 'bg-brand-600 text-white'
                            : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {img.isPrimary ? ' Principal' : ''}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {uniqueVariantColors.length > 0 ? (
                      <select
                        value={img.color}
                        onChange={(e) => setNewImages((prev) =>
                          prev.map((im, idx) => idx === i ? { ...im, color: e.target.value } : im)
                        )}
                        className="w-full mt-1 text-xs rounded-lg border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-300"
                      >
                        <option value="">Sem cor</option>
                        {uniqueVariantColors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={img.color}
                        onChange={(e) => setNewImages((prev) =>
                          prev.map((im, idx) => idx === i ? { ...im, color: e.target.value } : im)
                        )}
                        placeholder="Cor (ex: Azul)"
                        className="w-full mt-1 text-xs rounded-lg border border-gray-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-300"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Mais</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-5">
          {/* Publicação */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Publicação</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsActive(!isActive)}
                className={`relative w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-brand-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-gray-700 font-medium">{isActive ? 'Ativo — visível na loja' : 'Inativo — oculto'}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative w-10 h-6 rounded-full transition-colors ${isFeatured ? 'bg-yellow-400' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isFeatured ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-gray-700 font-medium">{isFeatured ? 'Em destaque' : 'Sem destaque'}</span>
            </label>
          </div>

          {/* Botões */}
          <Button type="submit" className="w-full" loading={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/admin/produtos')}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
