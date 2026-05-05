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

interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

interface ProductOption {
  id: number;
  name: string;
  price: number;
  images: { url: string }[];
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
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div className="relative">
      {img.imageUrl && draggingIndex !== index && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRequestDelete(index); }}
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
          <Image fill src={img.imageUrl} alt="preview" className="object-cover w-full h-full pointer-events-none" />
        ) : (
          <label className="cursor-pointer text-gray-400 text-sm flex flex-col items-center">
            <span>Click o arrastrá aquí</span>
            <input type="file" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onSelect(file, index); }} />
          </label>
        )}
      </div>
    </div>
  );
}

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminHomePage() {
  // --- Carousel state ---
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [imageToDeleteIndex, setImageToDeleteIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // --- Featured categories state ---
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [savingCategories, setSavingCategories] = useState(false);

  // --- Featured products state ---
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [savingProducts, setSavingProducts] = useState(false);

  const fetchWithRefresh = useFetchWithRefresh();
  const maxSlots = 6;

  useEffect(() => {
    // Load carousel images
    fetch(`${API}/carousel-image`)
      .then((res) => res.json())
      .then((data: CarouselImage[]) => setImages(data.map((img) => ({ id: img.id, imageUrl: img.imageUrl, order: img.order }))))
      .catch(() => toast.error("Error al cargar imágenes del carousel"));

    // Load categories
    fetch(`${API}/category`)
      .then((r) => r.json())
      .then((data: Category[]) => setAllCategories(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Load all products (for selection)
    fetch(`${API}/product`)
      .then((r) => r.json())
      .then((data: ProductOption[]) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Load existing featured config
    fetch(`${API}/pricing-config`, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } })
      .then((r) => r.json())
      .then((cfg) => {
        if (Array.isArray(cfg.featuredCategoryIds)) setSelectedCategoryIds(cfg.featuredCategoryIds);
        if (Array.isArray(cfg.featuredProductIds)) setSelectedProductIds(cfg.featuredProductIds);
      })
      .catch(() => {});
  }, []);

  // --- Carousel handlers ---
  const insertImage = (file: File, index: number) => {
    const url = URL.createObjectURL(file);
    const newImage: CarouselImage = { file, imageUrl: url, order: index, isNew: true };
    setImages((prev) => [...prev.filter((img) => img.order !== index), newImage]);
  };

  const handleRemoveConfirmed = async () => {
    if (imageToDeleteIndex === null) return;
    const img = images.find((img) => img.order === imageToDeleteIndex);
    if (!img) { setImageToDeleteIndex(null); return; }
    try {
      if (img.id) {
        const res = await fetchWithRefresh(`${API}/carousel-image/${img.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
      }
      setImages((prev) => prev.filter((img) => img.order !== imageToDeleteIndex));
      toast.success("Imagen eliminada ✅");
    } catch { toast.error("Error al eliminar imagen"); }
    finally { setImageToDeleteIndex(null); }
  };

  const placeholders = Array.from({ length: maxSlots }, (_, i) => images.find((img) => img.order === i) || { order: i });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingIndex(null);
    if (!over || active.id === over.id) return;
    const current = [...placeholders].sort((a, b) => a.order - b.order);
    const newOrder = arrayMove(current, Number(active.id), Number(over.id)).map((img, i) => ({ ...img, order: i }));
    setImages(newOrder);
  };

  const saveCarousel = async () => {
    try {
      const result: { imageUrl: string; order: number; id?: string }[] = [];
      for (const img of placeholders) {
        if (!img.imageUrl || typeof img.order !== "number" || isNaN(img.order) || img.order < 0) continue;
        let url = img.imageUrl;
        if ((img as CarouselImage).isNew && (img as CarouselImage).file) {
          const formData = new FormData();
          formData.append("file", (img as CarouselImage).file!);
          formData.append("order", String(img.order));
          const res = await fetchWithRefresh(`${API}/carousel-image/upload`, { method: "POST", body: formData });
          if (!res.ok) throw new Error("Error al subir imagen nueva");
          const data = await res.json();
          url = data.imageUrl;
        }
        result.push({ id: (img as CarouselImage).id, imageUrl: url, order: img.order });
      }
      const patchRes = await fetchWithRefresh(`${API}/carousel-image/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!patchRes.ok) throw new Error();
      toast.success("Carousel guardado ✅");
    } catch { toast.error("Error al guardar el carousel"); }
  };

  // --- Featured categories handlers ---
  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) { toast.warn("Máximo 4 categorías"); return prev; }
      return [...prev, id];
    });
  };

  const saveFeaturedCategories = async () => {
    setSavingCategories(true);
    try {
      const res = await fetchWithRefresh(`${API}/pricing-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredCategoryIds: selectedCategoryIds }),
      });
      if (!res.ok) throw new Error();
      toast.success("Categorías guardadas ✅");
    } catch { toast.error("Error al guardar categorías"); }
    finally { setSavingCategories(false); }
  };

  // --- Featured products handlers ---
  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 9) { toast.warn("Máximo 9 productos"); return prev; }
      return [...prev, id];
    });
  };

  const saveFeaturedProducts = async () => {
    setSavingProducts(true);
    try {
      const res = await fetchWithRefresh(`${API}/pricing-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredProductIds: selectedProductIds }),
      });
      if (!res.ok) throw new Error();
      toast.success("Productos guardados ✅");
    } catch { toast.error("Error al guardar productos"); }
    finally { setSavingProducts(false); }
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-12">

      {/* ── CAROUSEL ── */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Administrar Carousel</h1>
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setDraggingIndex(Number(active.id))}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={placeholders.map((img) => img.order)} strategy={verticalListSortingStrategy}>
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
          <button onClick={saveCarousel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            Guardar carousel
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
      </section>

      {/* ── CATEGORÍAS DESTACADAS ── */}
      <section>
        <h2 className="text-xl font-bold mb-1">Administrar Categorías</h2>
        <p className="text-sm text-gray-500 mb-4">
          Seleccioná hasta 4 categorías para mostrar en la home. El orden de selección se respeta.
          {selectedCategoryIds.length > 0 && (
            <span className="ml-2 font-medium text-gray-700">({selectedCategoryIds.length}/4 seleccionadas)</span>
          )}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allCategories.map((cat) => {
            const selected = selectedCategoryIds.includes(cat.id);
            const disabled = !selected && selectedCategoryIds.length >= 4;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                disabled={disabled}
                className={`
                  relative rounded-lg border-2 overflow-hidden text-left transition
                  ${selected ? "border-black ring-2 ring-black" : "border-gray-200 hover:border-gray-400"}
                  ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="relative w-full aspect-[4/3] bg-gray-100">
                  {cat.imageUrl && (
                    <Image src={cat.imageUrl} alt={cat.name} fill className="object-contain p-2" sizes="200px" />
                  )}
                  {selected && (
                    <div className="absolute top-1 right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {selectedCategoryIds.indexOf(cat.id) + 1}
                    </div>
                  )}
                </div>
                <div className="px-2 py-1 text-sm font-medium truncate">{cat.name}</div>
              </button>
            );
          })}
        </div>
        <div className="text-right mt-4">
          <button
            onClick={saveFeaturedCategories}
            disabled={savingCategories}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-60"
          >
            {savingCategories ? "Guardando…" : "Guardar categorías"}
          </button>
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ── */}
      <section>
        <h2 className="text-xl font-bold mb-1">Administrar Productos Destacados</h2>
        <p className="text-sm text-gray-500 mb-4">
          Seleccioná hasta 9 productos para mostrar en la home como destacados.
          {selectedProductIds.length > 0 && (
            <span className="ml-2 font-medium text-gray-700">({selectedProductIds.length}/9 seleccionados)</span>
          )}
        </p>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="mb-4 w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {filteredProducts.map((prod) => {
            const selected = selectedProductIds.includes(prod.id);
            const disabled = !selected && selectedProductIds.length >= 9;
            const cover = prod.images?.[0]?.url ?? null;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => toggleProduct(prod.id)}
                disabled={disabled}
                className={`
                  relative rounded-lg border-2 overflow-hidden text-left transition
                  ${selected ? "border-black ring-2 ring-black" : "border-gray-200 hover:border-gray-400"}
                  ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="relative w-full aspect-[4/3] bg-gray-100">
                  {cover ? (
                    <Image src={cover} alt={prod.name} fill className="object-cover" sizes="160px" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">Sin imagen</div>
                  )}
                  {selected && (
                    <div className="absolute top-1 right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {selectedProductIds.indexOf(prod.id) + 1}
                    </div>
                  )}
                </div>
                <div className="px-2 py-1">
                  <p className="text-xs font-medium line-clamp-2 leading-tight">{prod.name}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-right mt-4">
          <button
            onClick={saveFeaturedProducts}
            disabled={savingProducts}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-60"
          >
            {savingProducts ? "Guardando…" : "Guardar productos destacados"}
          </button>
        </div>
      </section>

    </div>
  );
}
