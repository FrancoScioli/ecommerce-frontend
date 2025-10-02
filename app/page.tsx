"use client";

import { useEffect, useState } from "react";
import Carousel from "@/components/Carousel";
import CategoryList from "@/components/CategoryList";
import { Category } from "@/types/Category";
import Spinner from "@/components/ui/Spinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_URL}/category?hideEmpty=true&withCounts=true&onlyActive=false`);
        if (!res.ok) throw new Error("Error al obtener categorías");
        const data: Category[] = await res.json();
        setCategories(data);
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
    fetchCategories();
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <main className="container mx-auto px-4 py-10 space-y-12">
      {/* Carrusel de banners o promociones */}
      <section>
        <Carousel />
      </section>

      {/* Título y descripción */}
      <section className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2">
          Productos de merchandising
        </h2>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">
          Descubre una variedad de regalos corporativos personalizados para
          fortalecer tus relaciones comerciales
        </p>
      </section>

      {/* Listado de categorías */}
      <section>
        {categories && categories.length > 0 ? (
          <CategoryList categories={categories} />
        ) : (
          <p className="text-center text-gray-700">No hay categorías aún.</p>
        )}
      </section>
    </main>
  );
}
