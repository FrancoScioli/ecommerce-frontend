"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Category } from "@/types/Category";
import Spinner from "@/components/ui/Spinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATS = [
  { num: "500+", label: "Productos" },
  { num: "15+", label: "Categorías" },
  { num: "100%", label: "Personalizable" },
  { num: "24h", label: "Respuesta" },
];

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          `${API_URL}/category?hideEmpty=true&withCounts=true&onlyActive=false`
        );
        if (!res.ok) throw new Error("Error al obtener categorías");
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    // pt-14 compensa el navbar fixed de h-14
    <main className="pt-14 bg-[#fafaf8]">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-16 items-center">

        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-blue-600 mb-5">
            <span className="block w-5 h-[1.5px] bg-blue-600" />
            Merchandising corporativo
          </span>

          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight text-[#111110] mb-5">
            Regalos que{" "}
            <em className="not-italic text-[#6b6b67]">representan</em>
            <br />tu marca
          </h1>

          <p className="text-[15px] leading-relaxed text-[#6b6b67] max-w-md mb-9">
            Productos personalizados de alta calidad para ferias, eventos y
            equipos. Desde bolígrafos hasta indumentaria.
          </p>

          <div className="flex items-center gap-4">

            {/* Ver productos — CSS hover dropdown */}
            <div className="group relative">
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 bg-[#111110] text-white text-sm font-medium px-5 py-3 rounded-xl transition hover:bg-[#2a2a28] select-none"
              >
                Ver productos
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Bridge invisible — evita el gap entre botón y panel */}
              <div className="absolute top-full left-0 w-full h-3" />

              {categories && categories.length > 0 && (
                <div className="absolute left-0 top-full pt-3 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
                  <Link
                    href="/tienda"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Ver todas las categorías
                  </Link>
                  <div className="bg-white border border-[#e8e8e4] rounded-2xl shadow-xl shadow-black/[0.08] p-2 min-w-[220px] max-h-[60vh] overflow-y-auto">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/tienda?category=${cat.id}`}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-[#111110] hover:bg-[#f4f4f0] transition-colors whitespace-nowrap"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4d4d0] flex-shrink-0" />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual card */}
        <div className="flex justify-end">
          <div className="relative w-full max-w-sm aspect-[4/3] bg-[#f4f4f0] rounded-2xl border border-[#e8e8e4] overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3 p-5 w-full">
              {["👜", "🖊️", "👕", "🌱"].map((emoji, i) => (
                <div key={i} className="bg-white rounded-xl aspect-square flex items-center justify-center text-3xl border border-[#e8e8e4] transition hover:scale-105">
                  {emoji}
                </div>
              ))}
            </div>
            <span className="absolute bottom-4 left-4 bg-[#111110] text-white text-[11px] font-medium px-3 py-1 rounded-full">
              +500 productos
            </span>
            <span className="absolute top-4 right-4 bg-white border border-[#e8e8e4] rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#111110] flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              En stock
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="bg-[#f4f4f0] border-y border-[#e8e8e4]">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ num, label }) => (
            <div key={label} className="text-center">
              <p className="font-serif text-3xl tracking-tight text-[#111110]">{num}</p>
              <p className="text-xs text-[#9b9b96] mt-1 tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
