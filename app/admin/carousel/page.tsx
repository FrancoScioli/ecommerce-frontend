"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";
import { toast } from "react-toastify";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import Image from "next/image";

interface CarouselImage {
  id?: string;
  imageUrl?: string;
  file?: File;
  order: number;
  isNew?: boolean;
}

function SortableItem({
  img,
  index,
  onRequestDelete,
  onDrop,
  onSelect,
  draggingIndex,
}: {
  img: CarouselImage;
  index: number;
  onRequestDelete: (index: number) => void;
  onDrop: (file: File, index: number) => void;
  onSelect: (file: File, index: number) => void;
  draggingIndex: number | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: img.order,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="relative">
      {img.imageUrl && draggingIndex !== index && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(index);
          }}
          className="absolute top-1 right-1 z-20 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center overflow-hidden bg-white hover:bg-gray-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) onDrop(file, index);
        }}
      >
        <div className="absolute top-1 left-1 text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
          {index + 1}
        </div>
        {img.imageUrl ? (
          <Image
            fill
            src={img.imageUrl}
            alt="preview"
            className="object-cover w-full h-full pointer-events-none"
          />
        ) : (
          <label className="cursor-pointer text-gray-400 text-sm flex flex-col items-center">
            <span>Click o arrastrá aquí</span>
            <input
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onSelect(file, index);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

export default function AdminCarouselPage() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [imageToDeleteIndex, setImageToDeleteIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const fetchWithRefresh = useFetchWithRefresh();
  const maxSlots = 6;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel-image`)
      .then((res) => res.json())
      .then((data: CarouselImage[]) => {
        const formatted = data.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          order: img.order,
        }));
        setImages(formatted);
      })
      .catch(() => toast.error("Error al cargar imágenes del carousel"));
  }, []);

  const insertImage = (file: File, index: number) => {
    const url = URL.createObjectURL(file);
    const newImage: CarouselImage = {
      file,
      imageUrl: url,
      order: index,
      isNew: true,
    };

    setImages(prev => {
      const updated = prev.filter(img => img.order !== index);
      return [...updated, newImage];
    });
  };

  const handleRemoveConfirmed = async () => {
    if (imageToDeleteIndex === null) return;

    const img = images.find(img => img.order === imageToDeleteIndex);
    if (!img) {
      setImageToDeleteIndex(null);
      return;
    }

    try {
      if (img.id) {
        const res = await fetchWithRefresh(
          `${process.env.NEXT_PUBLIC_API_URL}/carousel-image/${img.id}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error();
      }

      setImages(prev => prev.filter(img => img.order !== imageToDeleteIndex));
      toast.success("Imagen eliminada ✅");
    } catch {
      toast.error("Error al eliminar imagen");
    } finally {
      setImageToDeleteIndex(null);
    }
  };

  const placeholders = Array.from({ length: maxSlots }, (_, i) => {
    const found = images.find(img => img.order === i);
    return found || { order: i };
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingIndex(null);
    if (!over || active.id === over.id) return;

    const activeIndex = Number(active.id);
    const overIndex = Number(over.id);

    const current = [...placeholders].sort((a, b) => a.order - b.order);

    const newOrder = arrayMove(current, activeIndex, overIndex)
      .map((img, i) => ({ ...img, order: i }));

    setImages(newOrder);
  };


  const saveChanges = async () => {
    try {
      const result: { imageUrl: string; order: number; id?: string }[] = [];

      for (const img of placeholders) {
        if (!img.imageUrl || typeof img.order !== "number" || isNaN(img.order) || img.order < 0) continue;

        let url = img.imageUrl;

        if (img.isNew && img.file) {
          const formData = new FormData();
          formData.append("file", img.file);

          if (
            typeof img.order !== "number" ||
            isNaN(img.order) ||
            !Number.isInteger(img.order) ||
            img.order < 0
          ) {
            throw new Error("Order inválido antes de subir imagen");
          }
          formData.append("order", String(img.order));

          const res = await fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_URL}/carousel-image/upload`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Error al subir imagen nueva");

          const data = await res.json();
          url = data.imageUrl;
        }

        result.push({ id: img.id, imageUrl: url, order: img.order });
      }

      const patchRes = await fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_URL}/carousel-image/bulk`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });

      if (!patchRes.ok) throw new Error("Error al guardar el orden del carousel");

      toast.success("Carousel guardado con éxito ✅");
    } catch {
      toast.error("Error al guardar el carousel")
    }
  };





  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administrar Carousel</h1>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setDraggingIndex(Number(active.id))}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={placeholders.map((img) => img.order)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {placeholders.map((img, index) => (
              <SortableItem
                key={index}
                img={img}
                index={index}
                onRequestDelete={(i) => setImageToDeleteIndex(i)}
                onDrop={insertImage}
                onSelect={insertImage}
                draggingIndex={draggingIndex}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="text-right mt-4">
        <button
          onClick={saveChanges}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Guardar cambios
        </button>
      </div>

      <ConfirmationModal
        open={imageToDeleteIndex !== null}
        title="Eliminar imagen"
        message="¿Seguro que querés eliminar esta imagen del carousel?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleRemoveConfirmed}
        onCancel={() => setImageToDeleteIndex(null)}
      />
    </div>
  );
}
