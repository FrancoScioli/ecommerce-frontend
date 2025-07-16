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

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);

    const { addToCart } = useCart();

    useEffect(() => {
        if (!id) return;
        fetch(`${API_URL}/product/${id}`)
            .then((res) => res.json())
            .then((data: Product) => {
                setProduct(data);
                const firstVariant = data.variants?.[0]?.options?.[0]?.value || "";
                setSelectedVariant(firstVariant);
            });
    }, [id]);

    if (!product) return <Spinner />;

    const handleAddToCart = () => {
        if (quantity < 1) return;

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url || "",
            quantity,
            variant: selectedVariant,
        });
    };

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <Breadcrumbs
                path={[
                    { label: "Home", href: "/" },
                    { label: "Categorías", href: "/tienda" },
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
                            selected={selectedVariant}
                            onSelect={setSelectedVariant}
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

            <div className="mt-12 bg-gray-50 border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-2">Detalle del producto</h2>
                <p className="text-gray-700">{product.description}</p>
            </div>
        </div>
    );
}
