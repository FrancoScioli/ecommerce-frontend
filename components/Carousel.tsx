"use client";

import { useState, useEffect } from "react";
import SmartImage from "./SmartImage";

interface CarouselImage {
  id: string;
  imageUrl: string;
}

export default function Carousel() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carousel-image`);
      const data = await res.json();
      setImages(data);
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-64 overflow-hidden rounded">
      {images.map((img, idx) => (
        <div
          key={img.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? "opacity-100" : "opacity-0"
            }`}
        >
          <SmartImage
            src={img.imageUrl}
            alt={`Banner ${idx + 1}`}
            fill
            className="object-cover"
            priority={idx === 0}

          />
        </div>
      ))}
    </div>
  );
}
