"use client";

import { useState } from "react";
import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Product } from "@/types/Product";
import Spinner from "@/components/ui/Spinner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import ProductForm from "@/components/admin/ProductForm";
import AdminProductCard from "@/components/admin/AdminProductCard";
import { toast } from "react-toastify";

const TEXT_TITLE = "Administrar Productos";
const TEXT_LIST_TITLE = "Listado de Productos";
const TEXT_ERROR = "Error al cargar los productos.";
const TEXT_EMPTY = "No hay productos disponibles.";
const TEXT_DELETE_MODAL_TITLE = "Confirmar eliminación";
const TEXT_DELETE_MODAL_CONFIRM = "Eliminar";
const TEXT_DELETE_MODAL_CANCEL = "Cancelar";
const TEXT_DELETE_SUCCESS = "Producto eliminado correctamente.";
const TEXT_DELETE_ERROR = "No se pudo eliminar el producto. Verifica dependencias.";

export default function AdminProductsPage() {
  const fetchWithRefresh = useFetchWithRefresh();
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const {
    data: products,
    isLoading,
    isError,
    mutate,
  } = useAuthFetch<Product[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/product`
  );

  if (isLoading) return <Spinner />;
  if (isError)
    return <p className="text-red-500 text-center mt-10">{TEXT_ERROR}</p>;

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetchWithRefresh(
        `${process.env.NEXT_PUBLIC_API_URL}/product/${productToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error();
      toast.success(TEXT_DELETE_SUCCESS);
      setProductToDelete(null);
      mutate();
    } catch {
      toast.error(TEXT_DELETE_ERROR);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setModalMessage(null);
  };

  return (
    <section className="container mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold">{TEXT_TITLE}</h1>

      {/* Formulario para crear nuevos productos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <ProductForm onSuccess={() => mutate()} />
      </div>

      <h2 className="text-xl font-semibold">{TEXT_LIST_TITLE}</h2>

      {modalMessage && (
        <div className="p-4 rounded bg-green-100 text-green-800">
          {modalMessage}
        </div>
      )}

      {!products || products.length === 0 ? (
        <p className="text-center mt-10">{TEXT_EMPTY}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="relative">
              <AdminProductCard {...prod} />
              <button
                onClick={() => setProductToDelete(prod)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {productToDelete && (
        <ConfirmationModal
          open={Boolean(productToDelete)}
          title={TEXT_DELETE_MODAL_TITLE}
          message={`¿Eliminar producto "${productToDelete.name}"?`}
          confirmText={TEXT_DELETE_MODAL_CONFIRM}
          cancelText={TEXT_DELETE_MODAL_CANCEL}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </section>
  );
}
