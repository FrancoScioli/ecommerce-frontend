"use client";

import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";


interface CategoryFormProps {
  onSuccess: () => void;
}

export default function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [name, setName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fetchWithRefresh = useFetchWithRefresh();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageFile) return toast.error("Faltan datos");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", imageFile);

    try {
      const res = await fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_URL}/category`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return toast.error(err?.message || "Error al guardar la categoría");
      }
      toast.success("Categoría guardada");

      setName("");
      setImageFile(null);
      setPreview(null);
      onSuccess();
    } catch {
      toast.error("Error de red, inténtalo de nuevo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Nombre de la categoría
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Imagen de referencia
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
          required
        />
        {preview && (
          <Image
            src={preview}
            alt="Vista previa"
            width={128}
            height={128}
            className="mt-2 w-32 h-auto rounded border object-contain"
          />
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Guardar Categoría
      </button>
    </form>
  );
}
