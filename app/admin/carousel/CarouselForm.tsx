"use client";

import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";
import { useState } from "react";
import { toast } from "react-toastify";


export default function CarouselForm({ onUpload }: { onUpload: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const fetchWithRefresh = useFetchWithRefresh();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("order", order.toString());

    setUploading(true);
    try {
      const res = await fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_URL}/carousel-image/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Error al subir el carousel");
      onUpload();
      setFile(null);
      setOrder(0);
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input
        type="number"
        value={order}
        onChange={(e) => setOrder(Number(e.target.value))}
        className="border p-1 w-16"
        placeholder="Orden"
      />
      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={uploading}>
        {uploading ? "Subiendo..." : "Subir imagen"}
      </button>
    </form>
  );
}
