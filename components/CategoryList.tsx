"use client";

import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/Category";

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {categories.map((cat, idx) => {
        const src = cat.imageUrl?.trim() || null;

        return (
          <Link
            key={cat.id}
            href={`/tienda?category=${cat.id}`}
            className="
              block rounded-xl overflow-hidden
              border-2 border-black bg-white
              shadow-sm hover:shadow-lg hover:ring-2 hover:ring-black
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
              transition-all duration-150
            "
          >
            <div className="relative w-full aspect-[16/9] bg-white">
              {src ? (
                <Image
                  src={src}
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
        );
      })}
    </div>
  );
}
