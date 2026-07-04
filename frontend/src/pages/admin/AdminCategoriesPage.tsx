import { useEffect, useRef, useState } from 'react'
import { Plus, Edit2, Trash2, ImagePlus, X } from 'lucide-react'
import type { Category } from '@/types'
import { categoryService } from '@/services/categoryService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () =>
    categoryService.getAll().then(setCategories).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setDescription('')
    setImageFile(null)
    setImagePreview(null)
    setShowForm(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setName(c.name)
    setDescription(c.description ?? '')
    setImageFile(null)
    setImagePreview(c.imageUrl ?? null)
    setShowForm(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      let saved: Category
      if (editing) {
        saved = await categoryService.update(editing.id, {
          name,
          description,
          isActive: editing.isActive,
          displayOrder: editing.displayOrder,
        })
        toast.success('Categoria atualizada')
      } else {
        saved = await categoryService.create({ name, description })
        toast.success('Categoria criada')
      }

      // Upload da imagem se selecionada
      if (imageFile) {
        await categoryService.uploadImage(saved.id, imageFile)
      }

      setShowForm(false)
      load()
    } catch {
      toast.error('Erro ao salvar categoria')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Excluir "${catName}"?`)) return
    try {
      await categoryService.delete(id)
      toast.success('Categoria excluída')
      load()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Categorias</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Nova Categoria</Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tênis"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="Descrição opcional"
              />
            </div>

            {/* Upload de imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto da categoria</label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null) }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-brand-400 hover:bg-brand-50 transition-colors text-gray-400 hover:text-brand-600 flex-shrink-0"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">Adicionar</span>
                  </button>
                )}
                <div className="text-xs text-gray-400 pt-1">
                  <p>JPG, PNG ou WebP</p>
                  <p>Máx. 5MB</p>
                  {!imagePreview && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="mt-2 text-brand-600 font-medium hover:underline"
                    >
                      Escolher arquivo
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>Salvar</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">Nenhuma categoria cadastrada</p>
            <button onClick={openCreate} className="mt-2 text-brand-600 text-sm hover:underline">Criar primeira categoria</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Categoria</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Slug</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Produtos</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImagePlus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{c.slug}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{c.productCount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
