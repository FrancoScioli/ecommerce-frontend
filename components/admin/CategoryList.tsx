"use client";

import Image from "next/image";
import { Category } from "@/types/Category";

export default function CategoryList({ name, imageUrl }: Category) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow">
      <div className="relative h-40 w-full">
        <Image
          src={imageUrl}
          alt={name}
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>
      <div className="p-4 text-center font-medium">{name}</div>
    </div>
  );
}
