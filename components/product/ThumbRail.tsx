"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
    images: string[];
    onSelect: (i: number) => void;
    selectedIndex: number;
    maxVisible?: number; // cuántas mostrar antes del "+N"
};

export default function ThumbRail({
    images,
    onSelect,
    selectedIndex,
    maxVisible = 10,
}: Props) {
    const safe = useMemo(
        () => (Array.isArray(images) ? images.filter(Boolean) : []),
        [images]
    );

    const [expanded, setExpanded] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const railRef = useRef<HTMLDivElement | null>(null);

    const visible = expanded ? safe : safe.slice(0, maxVisible);
    const remaining = Math.max(safe.length - maxVisible, 0);

    // Actualiza flags de scroll para mostrar/ocultar flechas
    const updateScrollState = () => {
        const el = railRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 2);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };

    useEffect(() => {
        updateScrollState();
        const el = railRef.current;
        if (!el) return;
        const onScroll = () => updateScrollState();
        el.addEventListener("scroll", onScroll);
        const ro = new ResizeObserver(updateScrollState);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", onScroll);
            ro.disconnect();
        };
    }, [expanded, visible.length]);

    const scrollByAmount = (dir: "left" | "right") => {
        const el = railRef.current;
        if (!el) return;
        const step = el.clientWidth * 0.8;
        el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
    };

    const onWheel = (e: React.WheelEvent) => {
        const el = railRef.current;
        if (!el) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            el.scrollBy({ left: e.deltaY, behavior: "auto" });
        }
    };

    return (
        <div className="relative">
            {canScrollLeft && (
                <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent rounded-l-md" />
            )}
            {canScrollRight && (
                <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent rounded-r-md" />
            )}

            {canScrollLeft && (
                <button
                    type="button"
                    aria-label="Desplazar a la izquierda"
                    onClick={() => scrollByAmount("left")}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:bg-white"
                >
                    <svg viewBox="0 0 24 24" className="m-auto h-4 w-4">
                        <path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
            )}
            {canScrollRight && (
                <button
                    type="button"
                    aria-label="Desplazar a la derecha"
                    onClick={() => scrollByAmount("right")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:bg-white"
                >
                    {/* Ícono → */}
                    <svg viewBox="0 0 24 24" className="m-auto h-4 w-4">
                        <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
            )}

            <div
                ref={railRef}
                onWheel={onWheel}
                className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pr-10"
            >
                {visible.map((src, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border transition-colors ${i === selectedIndex
                            ? "border-blue-600 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        title={`Imagen ${i + 1}`}
                    >
                        <Image
                            src={src}
                            alt={`thumb-${i}`}
                            fill
                            sizes="60px"
                            className="object-cover"
                        />

                    </button>
                ))}

                {!expanded && remaining > 0 && (
                    <button
                        onClick={() => setExpanded(true)}
                        className="flex-shrink-0 h-12 px-3 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium hover:bg-gray-100"
                        title={`Ver ${remaining} más`}
                    >
                        +{remaining}
                    </button>
                )}
            </div>

            {expanded && safe.length > maxVisible && (
                <div className="mt-2">
                    <button
                        onClick={() => setExpanded(false)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                    >
                        <svg viewBox="0 0 24 24" className="h-3 w-3">
                            <path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Ver menos
                    </button>
                </div>
            )}
        </div>
    );
}
