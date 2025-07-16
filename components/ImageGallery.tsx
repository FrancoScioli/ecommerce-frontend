"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  images: string[];
}

export default function ImageGallery({ images }: Props) {
  const [selected, setSelected] = useState(images?.[0] || "");

  return (
    <div>
      <div className="mb-4 border rounded overflow-hidden">
        <Image
          src={selected}
          alt="Vista principal"
          className="w-full h-80 object-contain"
          width={500}
          height={500}
        />
      </div>
      <div className="flex gap-2">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setSelected(url)}
            className={`border rounded w-16 h-16 overflow-hidden ${selected === url ? "ring-2 ring-blue-500" : ""
              }`}
          >
            <Image
              src={url}
              alt={`img-${i}`}
              className="w-full h-full object-cover"
              width={500}
              height={500}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
