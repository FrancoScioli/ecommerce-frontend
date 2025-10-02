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
  const [images, setImages] = useState<File[]>([])
  const [variants, setVariants] = useState<VariantInput[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const fetchWithRefresh = useFetchWithRefresh()

  // Cargar categorías
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetchWithRefresh(`${API}/category`)
        const data: Category[] = await res.json()
        setAllCategories(data)

        // Preselección de categoría
        if (mode === "edit" && initialValues) {
          const incomingCatId =
            // intenta tomar la forma más común primero
            (initialValues as any).categoryId ??
            (initialValues as any).category?.id ??
            ""
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

  // Cargar valores del producto cuando entramos en modo edición
  useEffect(() => {
    if (mode !== "edit" || !initialValues) {
      // limpiar si venimos de editar a crear
      if (mode === "create") {
        setName("")
        setDescription("")
        setPrice("")
        setImages([])
        setVariants([])
      }
      return
    }

    setName(initialValues.name ?? "")
    setDescription(initialValues.description ?? "")
    setPrice(
      typeof initialValues.price === "number"
        ? String(initialValues.price)
        : (initialValues.price as any) ?? ""
    )

    // Variants → transformar a VariantInput
    const inVariants = ((initialValues as any).variants ?? []) as Array<{
      name: string
      options?: Array<{ value: string } | string>
    }>
    const normalized: VariantInput[] = inVariants.map((v) => ({
      name: v.name ?? "",
      options: Array.isArray(v.options)
        ? v.options.map((o: any) => (typeof o === "string" ? o : o?.value)).filter(Boolean)
        : [],
      inputValue: "",
    }))
    setVariants(normalized)
    setImages([]) // en edición, si no elige imágenes nuevas, no toca las actuales
  }, [mode, initialValues])

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    setImages(Array.from(e.target.files))
  }

  function addVariant() {
    setVariants((current) => [...current, { name: "", options: [], inputValue: "" }])
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, i) => i !== index))
  }

  function updateVariantName(index: number, value: string) {
    setVariants((current) =>
      current.map((v, i) => (i === index ? { ...v, name: value } : v))
    )
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
  }

  function removeOption(varIdx: number, optIdx: number) {
    setVariants((current) =>
      current.map((v, i) => {
        if (i !== varIdx) return v
        return { ...v, options: v.options.filter((_, oi) => oi !== optIdx) }
      })
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validaciones
    if (!name || !description || !price || !categoryId) {
      return toast.error("Faltan datos obligatorios")
    }
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return toast.error("El precio debe ser un número válido")
    }
    if (mode === "create" && images.length === 0) {
      return toast.error("Debes subir al menos una imagen")
    }

    // Armado FormData
    const form = new FormData()
    form.append("name", name)
    form.append("description", description)
    form.append("price", parsedPrice.toString())
    form.append("categoryId", categoryId.toString())

    const variantsPayload = variants
      .filter((v) => v.name.trim() && v.options.length > 0)
      .map((v) => ({
        name: v.name.trim(),
        options: v.options.map((o) => o.trim()).filter(Boolean),
      }))
    form.append("variants", JSON.stringify(variantsPayload))

    images.forEach((file) => form.append("images", file))

    // Endpoint según modo
    const url =
      mode === "edit" && initialValues
        ? `${API}/product/${initialValues.id}`
        : `${API}/product`
    const method = mode === "edit" ? "PUT" : "POST"

    try {
      setSubmitting(true)
      const res = await fetchWithRefresh(url, {
        method,
        body: form, // ⬅️ no seteamos Content-Type
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Error al guardar el producto")
      }

      toast.success(mode === "edit" ? "Producto actualizado" : "Producto creado")
      // Reset si es create; si es edit, salimos de edición
      if (mode === "create") {
        setName("")
        setDescription("")
        setPrice("")
        setImages([])
        setVariants([])
      } else {
        onCancelEdit?.()
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || "Error de red, inténtalo nuevamente")
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCats) return <p>Cargando categorías…</p>

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
          onChange={(e) => setCategoryId(+e.target.value)}
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

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {mode === "create" ? "Imágenes (al menos 1)" : "Imágenes (opcional: agrega nuevas)"}
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
