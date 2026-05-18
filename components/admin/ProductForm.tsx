"use client"

import { useEffect, useState, KeyboardEvent } from "react"
import { toast } from "react-toastify"
import { Category } from "@/types/Category"
import { Product } from "@/types/Product"
import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh"
import Image from "next/image"

type Mode = "create" | "edit"

interface VariantInput {
  name: string
  options: string[]
  inputValue: string
}

interface ProductFormProps {
  mode?: Mode
  initialValues?: Product
  onSuccess: () => void
  onCancelEdit?: () => void
}

function hasCategoryId(p: unknown): p is { categoryId: number } {
  return typeof (p as { categoryId?: unknown })?.categoryId === "number"
}

function hasCategoryObj(p: unknown): p is { category: { id: number } } {
  const cat = (p as { category?: unknown })?.category
  return typeof (cat as { id?: unknown })?.id === "number"
}

type RawOption = string | { value?: unknown }
type RawVariant = { name?: unknown; options?: unknown }

function isStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every((x) => typeof x === "string")
}

function extractOptionValue(opt: RawOption): string | null {
  if (typeof opt === "string") return opt
  const val = opt?.value
  return typeof val === "string" ? val : null
}

function normalizeVariant(v: unknown): VariantInput {
  const rv = (v ?? {}) as RawVariant
  const name = typeof rv.name === "string" ? rv.name : ""
  const optionsRaw = rv.options
  let options: string[] = []
  if (Array.isArray(optionsRaw)) {
    const collected: string[] = []
    for (const o of optionsRaw as RawOption[]) {
      const val = extractOptionValue(o)
      if (typeof val === "string" && val.trim()) collected.push(val.trim())
    }
    options = collected
  } else if (isStringArray(optionsRaw)) {
    options = optionsRaw.map((s) => s.trim()).filter(Boolean)
  }
  return { name, options, inputValue: "" }
}

function getIncomingCategoryId(initial: Product | undefined): number | "" {
  if (!initial) return ""
  if (hasCategoryId(initial)) return initial.categoryId
  if (hasCategoryObj(initial)) return initial.category.id
  return ""
}

export default function ProductForm({
  mode = "create",
  initialValues,
  onSuccess,
  onCancelEdit,
}: ProductFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState<number | "">("")
  const [isActive, setIsActive] = useState(true)
  const [images, setImages] = useState<File[]>([])
  const [variants, setVariants] = useState<VariantInput[]>([])
  const [variantsModified, setVariantsModified] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [coverImageId, setCoverImageId] = useState<number | null>(null)

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const fetchWithRefresh = useFetchWithRefresh()

  const isZecat = initialValues?.source === "ZECAT"

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetchWithRefresh(`${API}/category`)
        const data: Category[] = await res.json()
        setAllCategories(data)
        if (mode === "edit" && initialValues) {
          const incomingCatId = getIncomingCategoryId(initialValues)
          setCategoryId(incomingCatId || (data[0]?.id ?? ""))
        } else {
          if (data.length) setCategoryId(data[0].id)
        }
      } catch {
        toast.error("No se pudieron cargar las categorías")
      } finally {
        setLoadingCats(false)
      }
    }
    fetchCategories()
  }, [API, fetchWithRefresh, mode, initialValues])

  useEffect(() => {
    if (mode !== "edit" || !initialValues) {
      if (mode === "create") {
        setName("")
        setDescription("")
        setPrice("")
        setIsActive(true)
        setImages([])
        setVariants([])
        setCoverImageId(null)
      }
      return
    }

    setName(initialValues.name ?? "")
    setDescription(initialValues.description ?? "")
    const p: unknown = (initialValues as { price?: unknown }).price
    let priceStr = ""
    if (typeof p === "number") priceStr = String(p)
    else if (typeof p === "string") priceStr = p
    setPrice(priceStr)
    setIsActive(initialValues.isActive !== false)
    setCoverImageId(initialValues.coverImageId ?? null)

    const rawVariants = (initialValues as { variants?: unknown })?.variants
    const normalized: VariantInput[] = Array.isArray(rawVariants)
      ? (rawVariants as unknown[]).map(normalizeVariant)
      : []
    setVariants(normalized)
    setVariantsModified(false)
    setImages([])
  }, [mode, initialValues])

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    setImages(Array.from(e.target.files))
  }

  function addVariant() {
    setVariants((current) => [...current, { name: "", options: [], inputValue: "" }])
    setVariantsModified(true)
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, i) => i !== index))
    setVariantsModified(true)
  }

  function updateVariantName(index: number, value: string) {
    setVariants((current) =>
      current.map((v, i) => (i === index ? { ...v, name: value } : v))
    )
    setVariantsModified(true)
  }

  function updateOptionInput(index: number, value: string) {
    setVariants((current) =>
      current.map((v, i) => (i === index ? { ...v, inputValue: value } : v))
    )
  }

  function handleOptionKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key !== "Enter") return
    e.preventDefault()
    const trimmed = variants[index].inputValue.trim()
    if (!trimmed) return
    setVariants((current) =>
      current.map((v, i) => {
        if (i !== index) return v
        if (v.options.includes(trimmed)) return v
        return { ...v, options: [...v.options, trimmed], inputValue: "" }
      })
    )
    setVariantsModified(true)
  }

  function removeOption(varIdx: number, optIdx: number) {
    setVariants((current) =>
      current.map((v, i) => {
        if (i !== varIdx) return v
        return { ...v, options: v.options.filter((_, oi) => oi !== optIdx) }
      })
    )
    setVariantsModified(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name || !description || !price || !categoryId) return toast.error("Faltan datos obligatorios")

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) return toast.error("El precio debe ser un número válido")

    if (mode === "create" && images.length === 0) return toast.error("Debes subir al menos una imagen")

    const form = new FormData()
    form.append("name", name)
    form.append("description", description)
    form.append("price", parsedPrice.toString())
    form.append("categoryId", categoryId.toString())
    form.append("isActive", String(isActive))
    if (coverImageId !== null) form.append("coverImageId", String(coverImageId))

    // Solo enviar variants si fueron modificadas; de lo contrario el backend no las toca
    if (mode === "create" || variantsModified) {
      const variantsPayload = variants
        .filter((v) => v.name.trim() && v.options.length > 0)
        .map((v) => ({
          name: v.name.trim(),
          options: v.options.map((o) => o.trim()).filter(Boolean),
        }))
      form.append("variants", JSON.stringify(variantsPayload))
    }

    images.forEach((file) => form.append("images", file))

    const url =
      mode === "edit" && initialValues
        ? `${API}/product/${initialValues.id}`
        : `${API}/product`
    const method = mode === "edit" ? "PUT" : "POST"

    try {
      setSubmitting(true)
      const res = await fetchWithRefresh(url, { method, body: form })
      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error((errJson as { message?: string } | null)?.message || "Error al guardar el producto")
      }

      toast.success(mode === "edit" ? "Producto actualizado" : "Producto creado")
      if (mode === "create") {
        setName("")
        setDescription("")
        setPrice("")
        setIsActive(true)
        setImages([])
        setVariants([])
        setVariantsModified(false)
        setCoverImageId(null)
      } else {
        onCancelEdit?.()
      }
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de red, inténtalo nuevamente")
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCats) return <p>Cargando categorías…</p>

  const existingImages = initialValues?.images ?? []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "edit" && (
        <div className="flex items-center justify-between rounded bg-amber-50 px-3 py-2 text-amber-800">
          <span>Editando: {initialValues?.name}</span>
          {onCancelEdit && (
            <button type="button" onClick={onCancelEdit} className="text-sm underline">
              Cancelar edición
            </button>
          )}
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
          required
        />
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-medium mb-1">Precio ($)</label>
        <input
          type="text"
          inputMode="decimal"
          value={price}
          placeholder="0.00"
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded px-3 py-2 appearance-none"
          required
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
          required
        >
          {allCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Activo / Oculto */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <label htmlFor="isActive" className="text-sm font-medium select-none">
          Activo / Visible
        </label>
        {isZecat && (
          <span className="text-xs text-gray-400 ml-1">
            (En caso de ocultarse, el producto no se sincronizará)
          </span>
        )}
        {!isZecat && (
          <span className="text-xs text-gray-400 ml-1">
            (En caso de ocultarse, el producto no se mostrará en la tienda)
          </span>
        )}
      </div>

      {/* Imagen de portada — solo en edición con imágenes existentes */}
      {mode === "edit" && existingImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Imagen de portada</label>
          <p className="text-xs text-gray-400 mb-2">Seleccioná la imagen que se mostrará primero.</p>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img) => {
              const selected = coverImageId === img.id
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setCoverImageId(img.id)}
                  className={`relative w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                    selected
                      ? "border-blue-600 ring-2 ring-blue-400"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt="Miniatura"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {selected && (
                    <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-0.5">
                      Portada
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Imágenes nuevas */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {mode === "create" ? "Imágenes (al menos 1)" : "Agregar imágenes nuevas (opcional)"}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="w-full"
          required={mode === "create"}
        />
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((file, idx) => (
              <div key={idx} className="w-20 h-20 border rounded overflow-hidden">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${idx + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variantes */}
      <div>
        <label className="block text-sm font-medium mb-1">Variantes (opcionales)</label>
        {variants.map((variant, idx) => (
          <div key={idx} className="border p-4 rounded mb-4">
            <div className="flex justify-between items-center mb-2">
              <input
                value={variant.name}
                placeholder="Nombre variante (p. ej., Color)"
                onChange={(e) => updateVariantName(idx, e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Eliminar variante
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {variant.options.map((opt, oi) => (
                <span key={oi} className="bg-gray-200 px-2 py-1 rounded flex items-center">
                  {opt}
                  <button
                    type="button"
                    onClick={() => removeOption(idx, oi)}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              value={variant.inputValue}
              placeholder="Agregar opción (Enter)"
              onChange={(e) => updateOptionInput(idx, e.target.value)}
              onKeyDown={(e) => handleOptionKeyDown(e, idx)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ))}

        <button type="button" onClick={addVariant} className="text-sm text-blue-600 hover:underline">
          + Agregar nueva variante
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear Producto"}
      </button>
    </form>
  )
}
