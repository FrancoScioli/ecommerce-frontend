"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/Product";

function formatPrice(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export default function ProductList({ id, name, price, images }: Product) {
  const hasImages = images && images.length > 0;
  const cover = hasImages ? images[0].url : null;
  const extra = hasImages ? Math.max(images.length - 1, 0) : 0;

  return (
    <Link href={`/tienda/${id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
        {/* Contenedor con relación de aspecto estable */}
        <div className="relative w-full aspect-[4/3]">
          {cover ? (
            <>
              <Image
                src={cover}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />

              {/* Badge con +N si hay muchas fotos */}
              {extra > 0 && (
                <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-full bg-black/70 text-white">
                  +{extra}
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-500">
              Sin imagen
            </div>
          )}
          {/* Efecto hover sutil */}
          <div className="absolute inset-0 transition-transform group-hover:scale-[1.02]" />
        </div>

        <div className="p-4 space-y-1">
          <h3 className="font-medium leading-snug line-clamp-2">{name}</h3>
          <p className="font-semibold text-lg">{formatPrice(price)}</p>
        </div>
      </div>
    </Link>
  );
}
