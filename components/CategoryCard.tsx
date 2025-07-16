"use client";

import { Category } from "@/types/Category";
import Image from "next/image";

export function CategoryCard({ name, imageUrl }: Category) {
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold">{name}</h2>
      </div>
    </div>

  );
}
