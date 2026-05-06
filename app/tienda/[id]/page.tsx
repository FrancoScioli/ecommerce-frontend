"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/Product";
import Spinner from "@/components/ui/Spinner";
import ImageGallery from "@/components/ImageGallery";
import VariantSelector from "@/components/VariantSelector";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PrintingType {
    id: number;
    name: string;
    setupPrice: number;
    unitPrice: number;
    minUnits: number;
    baseTime: number;
    occupation: number;
    dayFactor: number;
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({});
    const [quantity, setQuantity] = useState<number>(1);

    // Calculador de personalización
    const [printQty, setPrintQty] = useState<number>(50);
    const [selectedTechnique, setSelectedTechnique] = useState<PrintingType | null>(null);

    const { addToCart } = useCart();

    useEffect(() => {
        if (!id) return;
        fetch(`${API_URL}/product/${id}`)
            .then((res) => res.json())
            .then((data: Product & { printingTypes?: PrintingType[] }) => {
                setProduct(data);
                const initialSelections: Record<number, string> = {};
                data.variants?.forEach((v: { id: number }) => {
                    initialSelections[v.id] = "";
                });
                setSelectedVariants(initialSelections);
                if (data.printingTypes?.length) {
                    setSelectedTechnique(data.printingTypes[0]);
                }
            });
    }, [id]);

    if (!product) return <Spinner />;

    const printingTypes: PrintingType[] = (product as any).printingTypes ?? [];

    const calcPrinting = () => {
        if (!selectedTechnique || printQty < 1) return null;
        const qty = printQty;
        const unitCost = selectedTechnique.unitPrice * qty;
        const setupCost = selectedTechnique.setupPrice;
        const total = unitCost + setupCost;
        const belowMin = qty < selectedTechnique.minUnits;
        const dayFactorCeil = Math.ceil(selectedTechnique.dayFactor * qty);
        const productionDays = selectedTechnique.baseTime + selectedTechnique.occupation + dayFactorCeil;
        return { unitCost, setupCost, total, belowMin, productionDays };
    };

    const printing = calcPrinting();

    const handleAddToCart = () => {
        if (quantity < 1) return;

        const variantLabel = product.variants
            ?.map((v: { id: number; name: string }) => `${v.name}: ${selectedVariants[v.id] ?? ""}`)
            .filter(Boolean)
            .join(" / ");

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url || "",
            quantity,
            variant: variantLabel || undefined,
        });
    };

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <Breadcrumbs
                path={[
                    { label: "Home", href: "/" },
                    { label: "Productos", href: "/tienda" },
                    {
                        label: product.category.name,
                        href: `/tienda?category=${product.category.id}`,
                    },
                    { label: product.name },
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <ImageGallery images={product.images.map((img) => img.url)} />

                <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <p className="text-xl text-gray-700">${product.price.toFixed(2)}</p>

                    {product.variants && (
                        <VariantSelector
                            variants={product.variants}
                            selected={selectedVariants}
                            onSelect={(variantId, value) =>
                                setSelectedVariants((prev) => ({ ...prev, [variantId]: value }))
                            }
                        />
                    )}

                    <div className="flex items-center gap-3">
                        <label htmlFor="quantity" className="text-sm text-gray-600">
                            Cantidad:
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            min={1}
                            max={999}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border rounded text-center"
                        />
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Agregar al carrito
                    </button>
                </div>
            </div>

            {/* Calculador de personalización */}
            {printingTypes.length > 0 && (
                <div className="bg-white border rounded-lg p-6 space-y-5">
                    <h2 className="text-lg font-semibold">Personalización con logo</h2>
                    <p className="text-sm text-gray-500">
                        Calculá el costo estimado de agregar tu logo a este producto según la técnica y la cantidad.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Técnica de impresión</label>
                            <select
                                className="w-full border px-3 py-2 rounded text-sm"
                                value={selectedTechnique?.id ?? ""}
                                onChange={(e) => {
                                    const found = printingTypes.find((t) => t.id === Number(e.target.value));
                                    setSelectedTechnique(found ?? null);
                                }}
                            >
                                {printingTypes.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de unidades</label>
                            <input
                                type="number"
                                min={1}
                                value={printQty}
                                onChange={(e) => setPrintQty(parseInt(e.target.value) || 1)}
                                className="w-full border px-3 py-2 rounded text-sm"
                            />
                            {selectedTechnique && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Mínimo sin cargo extra: {selectedTechnique.minUnits} unidades
                                </p>
                            )}
                        </div>
                    </div>

                    {printing && (
                        <div className="bg-gray-50 border rounded-lg p-4 space-y-2 text-sm">
                            {printing.belowMin && (
                                <p className="text-amber-600 font-medium">
                                    ⚠ La cantidad ingresada está por debajo del mínimo ({selectedTechnique!.minUnits} u.). Se aplicará un cargo adicional.
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-gray-700">
                                <span>Costo de setup:</span>
                                <span className="font-medium">${printing.setupCost.toFixed(2)}</span>
                                <span>Costo por unidad × {printQty}:</span>
                                <span className="font-medium">${printing.unitCost.toFixed(2)}</span>
                                <span className="font-semibold text-gray-900 border-t pt-1">Total personalización:</span>
                                <span className="font-bold text-gray-900 border-t pt-1">${printing.total.toFixed(2)}</span>
                                <span>Tiempo de producción estimado:</span>
                                <span className="font-medium">{printing.productionDays} día{printing.productionDays !== 1 ? "s" : ""}</span>
                            </div>
                            <p className="text-xs text-gray-400 pt-1">
                                * Los precios de personalización no incluyen el costo del producto. Consultá con nosotros para confirmar disponibilidad y precio final.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-gray-50 border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-2">Detalle del producto</h2>
                <p className="text-gray-700">{product.description}</p>
            </div>
        </div>
    );
}
