"use client";

import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Category } from "@/types/Category";

interface CategoryFormProps {
  onSuccess: () => void;
  mode?: "create" | "edit";
  initialValues?: Category;
  onCancelEdit?: () => void;
}

export default function CategoryForm({
  onSuccess,
  mode = "create",
  initialValues,
  onCancelEdit,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [lockName, setLockName] = useState(false);
  const [lockImage, setLockImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchWithRefresh = useFetchWithRefresh();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setName(initialValues.name);
      setLockName(initialValues.lockName ?? false);
      setLockImage(initialValues.lockImage ?? false);
      setPreview(initialValues.imageUrl || null);
      setImageFile(null);
    } else {
      setName("");
      setLockName(false);
      setLockImage(false);
      setPreview(null);
      setImageFile(null);
    }
  }, [mode, initialValues]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("El nombre es obligatorio");
    if (mode === "create" && !imageFile) return toast.error("La imagen es obligatoria");

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("lockName", String(lockName));
    formData.append("lockImage", String(lockImage));
    if (imageFile) formData.append("image", imageFile);

    const url =
      mode === "edit" && initialValues
        ? `${process.env.NEXT_PUBLIC_API_URL}/category/${initialValues.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/category`;

    try {
      const res = await fetchWithRefresh(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return toast.error(err?.message || "Error al guardar la categoría");
      }
      toast.success(mode === "edit" ? "Categoría actualizada" : "Categoría guardada");
      setName("");
      setImageFile(null);
      setPreview(null);
      setLockName(false);
      setLockImage(false);
      onSuccess();
    } catch {
      toast.error("Error de red, inténtalo de nuevo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-base font-semibold">
        {mode === "edit" ? `Editando: ${initialValues?.name}` : "Nueva Categoría"}
      </h2>

      {/* Nombre */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <label className="text-sm font-medium">Nombre de la categoría</label>
          {mode === "edit" && (
            <label className="flex items-center gap-1.5 text-xs text-amber-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lockName}
                onChange={(e) => setLockName(e.target.checked)}
                className="accent-amber-600"
              />
              No sincronizar nombre
            </label>
          )}
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* Imagen */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <label className="text-sm font-medium">
            {mode === "edit" ? "Reemplazar imagen (opcional)" : "Imagen de referencia"}
          </label>
          {mode === "edit" && (
            <label className="flex items-center gap-1.5 text-xs text-amber-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lockImage}
                onChange={(e) => setLockImage(e.target.checked)}
                className="accent-amber-600"
              />
              No sincronizar imagen
            </label>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
          required={mode === "create"}
        />
        {preview && (
          <Image
            src={preview}
            alt="Vista previa"
            width={128}
            height={128}
            className="mt-2 w-32 h-auto rounded border object-contain bg-white"
            unoptimized={preview.startsWith("blob:")}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Guardar Categoría"}
        </button>
        {mode === "edit" && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
