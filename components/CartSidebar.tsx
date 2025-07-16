"use client";

import { useCart } from "@/context/CartContext";
import { X, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
  const {
    cart,
    removeFromCart,
    total,
    isOpen,
    toggleSidebar,
    clearCart,
  } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToCheckout = () => {
    if (cart.length === 0) {
      toast.warning("El carrito está vacío");
      return;
    }
    toggleSidebar(false);
    router.push("/checkout");
  };

  return (
    <div>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => toggleSidebar(false)}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-lg flex flex-col p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tu carrito</h2>
          <button onClick={() => toggleSidebar(false)} className="text-gray-500">
            <X size={24} />
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">Tu carrito está vacío</p>
        ) : (
          <>
            <ul className="space-y-4 flex-1">
              {cart.map(item => (
                <li
                  key={`${item.id}-${item.variant ?? 'default'}`}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.variant && (
                      <p className="text-sm text-gray-500">{item.variant}</p>
                    )}
                    <p className="text-sm">
                      x{item.quantity} – ${item.price * item.quantity}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.variant)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t pt-4">
              <p className="font-semibold text-right mb-4">Total: ${total.toFixed(2)}</p>
              <div className="flex justify-between">
                <button
                  onClick={clearCart}
                  className="px-3 py-1 text-sm text-red-500 border border-red-500 rounded hover:bg-red-100"
                >
                  Vaciar
                </button>
                <button
                  onClick={handleGoToCheckout}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Finalizar compra
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
