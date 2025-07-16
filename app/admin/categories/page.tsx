"use client";

import { useState } from "react";
import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";
import { useAuthFetch } from "@/hooks/useAuthFetch";

import { CategoryCard } from "@/components/CategoryCard";
import Spinner from "@/components/ui/Spinner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Category } from "@/types/Category";
import CategoryForm from "@/components/admin/CategoryForm";
import { toast } from "react-toastify";

const TEXT_TITLE = "Administrar Categorías";
const TEXT_LIST_TITLE = "Listado de Categorías";
const TEXT_ERROR = "Error al cargar las categorías.";
const TEXT_EMPTY = "No hay categorías disponibles.";
const TEXT_DELETE_MODAL_TITLE = "Confirmar eliminación";
const TEXT_DELETE_MODAL_CONFIRM = "Eliminar";
const TEXT_DELETE_MODAL_CANCEL = "Cancelar";
const TEXT_DELETE_SUCCESS = "Categoría eliminada correctamente.";
const TEXT_DELETE_ERROR =
  "No se pudo eliminar. Asegúrate de no tener productos asociados.";

export default function AdminCategoriesPage() {
  const fetchWithRefresh = useFetchWithRefresh();
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const {
    data: categories,
    isLoading,
    isError,
    mutate,
  } = useAuthFetch<Category[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/category`
  );

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-red-500 text-center mt-10">{TEXT_ERROR}</p>;

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetchWithRefresh(
        `${process.env.NEXT_PUBLIC_API_URL}/category/${categoryToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error();
      toast.success(TEXT_DELETE_SUCCESS);
      setCategoryToDelete(null);
      mutate();
    } catch {
      toast.error(TEXT_DELETE_ERROR);
      setCategoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setCategoryToDelete(null);
    setModalMessage(null);
  };

  return (
    <section className="container mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold">{TEXT_TITLE}</h1>

      {/* Formulario para crear nuevas categorías */}
      <div className="bg-white p-6 rounded-lg shadow">
        <CategoryForm onSuccess={() => mutate()} />
      </div>

      <h2 className="text-xl font-semibold">{TEXT_LIST_TITLE}</h2>

      {!categories || categories.length === 0 ? (
        <p className="text-center mt-10">{TEXT_EMPTY}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="relative">
              <CategoryCard {...cat} />
              <button
                onClick={() => {
                  setModalMessage(`¿Eliminar categoría "${cat.name}"?`)
                  setCategoryToDelete(cat)
                }
                }
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {categoryToDelete && (
        <ConfirmationModal
          open={Boolean(categoryToDelete)}
          title={TEXT_DELETE_MODAL_TITLE}
          message={modalMessage || ""}
          confirmText={TEXT_DELETE_MODAL_CONFIRM}
          cancelText={TEXT_DELETE_MODAL_CANCEL}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </section>
  );
}
