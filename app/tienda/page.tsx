"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Product } from "@/types/Product";
import Spinner from "@/components/ui/Spinner";
import ProductList from "@/components/product/ProductList";
import { SlidersHorizontal, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SortOption = "az" | "za" | "price-asc" | "price-desc";

interface NavCategory {
  id: number;
  name: string;
}

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("az");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const params = useSearchParams();
  const categoryId = params.get("category");
  const searchQuery = params.get("query");

  useEffect(() => {
    fetch(`${API_URL}/category`)
      .then((r) => r.json())
      .then((data: NavCategory[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (categoryId) setSelectedCategories([Number(categoryId)]);
  }, [categoryId]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        let data: Product[] = [];

        if (searchQuery) {
          const res = await fetch(
            `${API_URL}/public/search?q=${encodeURIComponent(searchQuery)}&limit=100`
          );
          if (!res.ok) throw new Error("Error al buscar productos");
          const json = await res.json();
          data = (json.products ?? []).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            images: p.imageUrl ? [{ url: p.imageUrl }] : [],
            category: p.categoryId ? { id: p.categoryId, name: p.categoryName ?? "" } : null,
          }));
        } else {
          const res = await fetch(`${API_URL}/product`);
          if (!res.ok) throw new Error("Error al obtener productos");
          data = await res.json();
        }

        setProducts(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter(
        (p) => p.category && selectedCategories.includes((p.category as any).id)
      );
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) result = result.filter((p) => p.price >= min);
    if (!isNaN(max)) result = result.filter((p) => p.price <= max);

    const cmp = (a: string, b: string) =>
      a.localeCompare(b, undefined, { sensitivity: "base", ignorePunctuation: true });

    switch (sort) {
      case "az": result.sort((a, b) => cmp(a.name, b.name)); break;
      case "za": result.sort((a, b) => cmp(b.name, a.name)); break;
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
    }

    return result;
  }, [products, selectedCategories, minPrice, maxPrice, sort]);

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters = selectedCategories.length > 0 || minPrice !== "" || maxPrice !== "";

  const title = searchQuery
    ? `Resultados para "${searchQuery}"`
    : "Todos los Productos";

  const FilterSidebar = () => (
    <div className="space-y-6 text-sm">
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-gray-500 hover:text-black underline text-xs"
        >
          Limpiar filtros
        </button>
      )}

      {/* Rango de precios */}
      <div>
        <h3 className="font-semibold mb-3">Precio</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <span className="text-gray-400 flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Categorías */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Categoría</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="rounded border-gray-300 accent-black"
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">{title}</h1>
          <span className="text-sm text-gray-400">({filteredProducts.length} productos)</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            className="md:hidden flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 text-sm"
            onClick={() => setSidebarOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="az">Alfabéticamente: A–Z</option>
            <option value="za">Alfabéticamente: Z–A</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-20">
            <FilterSidebar />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductList key={prod.id} {...prod} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-24">
              No se encontraron productos con los filtros aplicados.
            </p>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Filtros</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar />
            <button
              onClick={() => setSidebarOpen(false)}
              className="mt-6 w-full bg-black text-white py-2 rounded-md text-sm"
            >
              Ver {filteredProducts.length} productos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
