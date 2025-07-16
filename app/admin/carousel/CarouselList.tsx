"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface CarouselImage {
  id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export default function CarouselList() {
  const [images, setImages] = useState<CarouselImage[]>([]);

  const fetchImages = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel-image`);
    const data = await res.json();
    setImages(data);
  };

  const deactivate = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel-image/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ isActive: false }),
    });
    fetchImages();
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {images.map((img) => (
        <div key={img.id} className="relative border rounded p-2">
          <Image src={img.imageUrl} fill alt="carousel" className="w-full h-32 object-cover rounded" />
          <div className="text-sm mt-1">Orden: {img.order}</div>
          <button
            className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded"
            onClick={() => deactivate(img.id)}
          >
            Desactivar
          </button>
        </div>
      ))}
    </div>
  );
}
