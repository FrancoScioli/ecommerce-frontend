"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BANK_INFO } from "@/constants/constants";
import { useCart } from "@/context/CartContext";

export default function PaymentTransferPage() {
  const [total, setTotal] = useState<number | null>(null);
  const [valid, setValid] = useState(false);
  const router = useRouter();
  const { clearCart } = useCart();
  const validatedOnce = useRef(false);

  useEffect(() => {
    if (validatedOnce.current) return;
    validatedOnce.current = true;

    const flag = localStorage.getItem("justPurchased");
    const raw = localStorage.getItem("transferTotal");

    if (flag !== "true" || !raw) {
      router.replace("/tienda");
      return;
    }

    const val = Number(raw);
    if (isNaN(val)) {
      router.replace("/tienda");
      return;
    }

    setTotal(val);
    setValid(true);
    clearCart();

    setTimeout(() => {
      localStorage.removeItem("justPurchased");
      localStorage.removeItem("transferTotal");
    }, 1000);
  }, [router, clearCart]);

  if (!valid) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Pago por Transferencia Bancaria</h1>
      <ul className="mb-4 bg-gray-50 p-4 rounded border border-gray-200">
        {Object.entries(BANK_INFO).map(([key, value]) => (
          <li key={key}>
            <strong>{key.toUpperCase()}:</strong> {value}
          </li>
        ))}
      </ul>
      <p className="mb-4"><strong>Total a transferir:</strong> ${total?.toFixed(2)}</p>
      <p className="mt-6">
        Una vez realizada la transferencia, envíanos el comprobante a <strong>ventas@ejemplo.com</strong>.
      </p>
    </div>
  );
}
