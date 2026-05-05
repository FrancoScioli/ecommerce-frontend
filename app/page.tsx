"use client";

import { useEffect, useState } from "react";
import Carousel from "@/components/Carousel";
import ProductList from "@/components/product/ProductList";
import Image from "next/image";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

interface FeaturedCategory {
  id: number;
  name: string;
  imageUrl: string;
}

interface FeaturedProduct {
  id: number;
  name: string;
  price: number;
  images: { url: string }[];
}

interface HomeData {
  categories: FeaturedCategory[];
  products: FeaturedProduct[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/public/home-data`)
      .then((r) => r.json())
      .then((data: HomeData) => setHomeData(data))
      .catch(() => setHomeData({ categories: [], products: [] }))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;

  const hasCategories = (homeData?.categories?.length ?? 0) > 0;
  const hasProducts = (homeData?.products?.length ?? 0) > 0;

  return (
    <main className="container mx-auto px-4 py-10 space-y-16">

      {/* Carrusel */}
      <section>
        <Carousel />
      </section>

      {/* Categorías destacadas */}
      {hasCategories && (
        <section>
          <div className={`grid gap-4 ${homeData!.categories.length === 1 ? "grid-cols-1 max-w-lg mx-auto" : homeData!.categories.length === 2 ? "grid-cols-1 sm:grid-cols-2" : homeData!.categories.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-2 md:grid-cols-4"}`}>
            {homeData!.categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/tienda?category=${cat.id}`}
                className="block rounded-xl overflow-hidden border-2 border-black bg-white shadow-sm hover:shadow-lg hover:ring-2 hover:ring-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all duration-150"
              >
                <div className="relative w-full aspect-[16/9] bg-white">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4"
                      priority={idx < 4}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-50">
                      <span className="text-sm text-gray-400">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-medium leading-snug line-clamp-1">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      {hasProducts && (
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
            Productos Destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {homeData!.products.map((prod) => (
              <ProductList key={prod.id} {...prod} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/tienda"
              className="inline-block border-2 border-black text-black px-8 py-3 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition"
            >
              Ver todos los productos
            </Link>
          </div>
        </section>
      )}

      {/* Fallback si no hay nada configurado */}
      {!hasCategories && !hasProducts && (
        <section className="text-center py-10 text-gray-400 text-sm">
          Configurá las categorías y productos destacados desde el panel admin.
        </section>
      )}

    </main>
  );
}
