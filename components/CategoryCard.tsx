"use client";

import { Category } from "@/types/Category";
import Image from "next/image";
import { useState } from "react";

export function CategoryCard({ name, imageUrl }: Category) {
  const [error, setError] = useState(false);

  return (
    <div
      className="
        group rounded-xl overflow-hidden
        border-[3px] border-black
        bg-white
        shadow-sm hover:shadow-xl
        hover:-translate-y-0.5
        focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2
        transition-all duration-150
      "
    >
      <div className="relative w-full aspect-[16/9] bg-white">
        {!error && imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-50">
            <span className="text-sm text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-base font-semibold leading-snug line-clamp-1">
          {name}
        </h2>
      </div>
    </div>
  );
}
