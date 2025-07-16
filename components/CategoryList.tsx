"use client";

import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/Category";

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/tienda?category=${cat.id}`}
          className="block bg-white rounded-lg shadow hover:shadow-lg overflow-hidden"
        >
          <div className="relative h-40 w-full">
            <Image
              src={cat.imageUrl}
              alt={cat.name}
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
          <div className="p-4 text-center">
            <h3 className="font-medium">{cat.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
