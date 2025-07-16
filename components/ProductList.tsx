"use client";

import Image from "next/image";
import { Product } from "@/types/Product";
import Link from "next/link";

export default function ProductList({ id, name, price, images, category }: Product) {
  return (
    <Link href={`/tienda/${id}`}>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative h-40 w-full">
          {images && images.length > 0 ? (
            <Image
              src={images[0].url}
              alt={name}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-medium">{name}</h3>
          <p className="text-gray-600">Categoría: {category.name}</p>
          <p className="font-bold text-lg">${price.toFixed(2)}</p>
        </div>
      </div>
    </Link>

  );
}
