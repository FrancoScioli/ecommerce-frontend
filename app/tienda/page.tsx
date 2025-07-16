"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "@/types/Product";
import Spinner from "@/components/ui/Spinner";
import ProductList from "@/components/ProductList";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const params = useSearchParams();
  const categoryId = params.get("category");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const query = categoryId ? `?categoryId=${categoryId}` : "";
        const res = await fetch(`${API_URL}/product${query}`);
        if (!res.ok) throw new Error("Error al obtener productos");
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [categoryId]);

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold">
        {categoryId ? `Categoría #${categoryId}` : "Todos los Productos"}
      </h1>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((prod) => (
            <ProductList key={prod.id} {...prod} />
          ))}
        </div>
      ) : (
        <p className="text-center">No hay productos para mostrar.</p>
      )}
    </div>
  );
}
