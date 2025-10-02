"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import ThumbRail from "./product/ThumbRail";

type Props = { images: string[] }; // le pasás product.images.map(i => i.url)

export default function ImageGallery({ images }: Props) {
  const [index, setIndex] = useState(0);

  const safe = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );
  const has = safe.length > 0;
  const cover = has ? safe[Math.min(index, safe.length - 1)] : null;

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-square rounded-md border bg-white">
        {cover ? (
          <Image
            src={cover}
            alt="Imagen del producto"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Sin imagen
          </div>
        )}
      </div>

      {has && (
        <ThumbRail
          images={safe}
          selectedIndex={index}
          onSelect={setIndex}
          maxVisible={10}
        />
      )}
    </div>
  );
}
