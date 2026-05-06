"use client";

import { useRef, useState } from "react";
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
  const formRef = useRef<HTMLDivElement>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const {
    data: products,
    isLoading,
    isError,
    mutate,
  } = useAuthFetch<Product[]>(`${process.env.NEXT_PUBLIC_API_URL}/product`);

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
  };

  return (
    <section className="container mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold">{TEXT_TITLE}</h1>

      {/* Formulario para crear/editar productos */}
      <div ref={formRef} className="bg-white p-6 rounded-lg shadow">
        <ProductForm
          mode={editingProduct ? 'edit' : 'create'}
          initialValues={editingProduct ?? undefined}
          onCancelEdit={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            mutate();
          }}
        />
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{TEXT_LIST_TITLE}</h2>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {!products || products.length === 0 ? (
        <p className="text-center mt-10">{TEXT_EMPTY}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((prod) => (
            <div key={prod.id} className="relative">
              <AdminProductCard {...prod} />

              {/* Botón Editar */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(prod);
                    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                  }}
                  className="bg-slate-600 text-white px-2 py-1 text-xs rounded hover:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => setProductToDelete(prod)}
                  className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación eliminar */}
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
