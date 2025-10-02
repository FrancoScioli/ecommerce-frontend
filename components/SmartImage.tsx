"use client";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

type Props = Omit<ImageProps, "unoptimized"> & { fallbackToUnoptimized?: boolean };

export default function SmartImage({ fallbackToUnoptimized = true, onError, ...rest }: Props) {
  const [unopt, setUnopt] = useState(false);
  useEffect(() => setUnopt(false), [rest.src]);
  return (
    <Image
      {...rest}
      unoptimized={unopt}
      alt="optimized carousel image"
      onError={(e) => {
        if (fallbackToUnoptimized && !unopt) setUnopt(true);
        onError?.(e);
      }}
    />
  );
}
