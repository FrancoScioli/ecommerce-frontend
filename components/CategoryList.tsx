"use client";

import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/Category";

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {categories.map((cat, idx) => {
        const src = cat.imageUrl?.trim() || null;

        return (
          <Link
            key={cat.id}
            href={`/tienda?category=${cat.id}`}
            className="group block bg-[#f4f4f0] border border-[#e8e8e4] rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#c8c8c4] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111110]"
          >
            {/* Image area */}
            <div className="relative w-full aspect-square bg-white">
              {src ? (
                <Image
                  src={src}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.04]"
                  priority={idx < 4}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <svg
                    className="w-10 h-10 text-[#d4d4d0]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
              )}
            </div>

            {/* Label */}
            <div className="px-4 py-3 border-t border-[#e8e8e4]">
              <h3 className="text-[13px] font-medium text-[#111110] leading-snug line-clamp-1 text-center">
                {cat.name}
              </h3>
              {cat._count !== undefined && (
                <p className="text-[11px] text-[#6b6b67] text-center mt-0.5">
                  {cat._count.products} producto{cat._count.products !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
