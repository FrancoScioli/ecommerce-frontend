"use client";

import { useRef, useState } from "react";
import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { CategoryCard } from "@/components/CategoryCard";
import Spinner from "@/components/ui/Spinner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Category } from "@/types/Category";
import CategoryForm from "@/components/admin/CategoryForm";
import { toast } from "react-toastify";
import { Lock } from "lucide-react";

export default function AdminCategoriesPage() {
  const fetchWithRefresh = useFetchWithRefresh();
  const formRef = useRef<HTMLDivElement>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");

  const { data: categories, isLoading, isError, mutate } = useAuthFetch<Category[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/category`
  );

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-red-500 text-center mt-10">Error al cargar las categorías.</p>;

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleCancelEdit = () => setEditingCategory(null);

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetchWithRefresh(
        `${process.env.NEXT_PUBLIC_API_URL}/category/${categoryToDelete.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast.success("Categoría eliminada correctamente.");
      setCategoryToDelete(null);
      mutate();
    } catch {
      toast.error("No se pudo eliminar. Asegurate de no tener productos asociados.");
      setCategoryToDelete(null);
    }
  };

  const filtered = (categories ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="container mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold">Administrar Categorías</h1>

      {/* Formulario crear / editar */}
      <div ref={formRef} className="bg-white p-6 rounded-lg shadow">
        <CategoryForm
          mode={editingCategory ? "edit" : "create"}
          initialValues={editingCategory ?? undefined}
          onCancelEdit={handleCancelEdit}
          onSuccess={() => {
            setEditingCategory(null);
            mutate();
          }}
        />
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">Listado de Categorías</h2>
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center mt-10 text-gray-500">
          {search ? "Sin resultados para esa búsqueda." : "No hay categorías disponibles."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((cat) => (
            <div key={cat.id} className="relative">
              <CategoryCard {...cat} />

              {/* Badges de lock */}
              {(cat.lockName || cat.lockImage) && (
                <div className="absolute top-2 left-2 flex gap-1">
                  {cat.lockName && (
                    <span className="flex items-center gap-0.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      <Lock className="w-2.5 h-2.5" /> Nombre
                    </span>
                  )}
                  {cat.lockImage && (
                    <span className="flex items-center gap-0.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      <Lock className="w-2.5 h-2.5" /> Imagen
                    </span>
                  )}
                </div>
              )}

              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-slate-600 text-white px-2 py-1 text-xs rounded hover:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {categoryToDelete && (
        <ConfirmationModal
          open={Boolean(categoryToDelete)}
          title="Confirmar eliminación"
          message={`¿Eliminar categoría "${categoryToDelete.name}"?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setCategoryToDelete(null)}
        />
      )}
    </section>
  );
}
