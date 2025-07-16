"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "react-toastify";

export default function CheckoutRedirectHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const { cart, cartLoaded } = useCart();

    useEffect(() => {
        if (!cartLoaded) return;

        const allowEmptyCart = ["/payment-transfer", "/payment-success", "/payment-failure", "/payment-pending"];
        if (allowEmptyCart.includes(pathname)) return;

        if (pathname === "/checkout" && cart.length === 0) {
            toast.info("El carrito está vacío. Redirigiendo...");
            router.push("/tienda");
        }
    }, [cart.length, cartLoaded, pathname, router]);

    return null;
}
