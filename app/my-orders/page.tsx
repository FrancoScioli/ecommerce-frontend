"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { FiShoppingBag } from "react-icons/fi";
import { toast } from "react-toastify";

const API = process.env.NEXT_PUBLIC_API_URL;

interface SaleProduct {
  variant: string | null;
  product: { id: number; name: string; price: number };
}

interface Order {
  id: number;
  total: number;
  createdAt: string;
  saleProducts: SaleProduct[];
}

interface GroupedItem {
  name: string;
  variant: string | null;
  price: number;
  qty: number;
}

function groupItems(saleProducts: SaleProduct[]): GroupedItem[] {
  const acc: Record<string, GroupedItem> = {};
  for (const sp of saleProducts) {
    const key = `${sp.product.id}__${sp.variant ?? ""}`;
    if (acc[key]) {
      acc[key].qty++;
    } else {
      acc[key] = { name: sp.product.name, variant: sp.variant, price: sp.product.price, qty: 1 };
    }
  }
  return Object.values(acc);
}

export default function MyOrdersPage() {
  const { userId, accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/sales/user/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setOrders)
      .catch(() => toast.error("No se pudieron cargar tus compras"));
  }, [userId, accessToken]);

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Mis compras</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No tenés compras registradas.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <FiShoppingBag />
                    Pedido #{order.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fecha: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                  <p className="text-sm text-gray-600">Total: ${order.total.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setExpandedId(prev => prev === order.id ? null : order.id)}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                >
                  {expandedId === order.id ? "Ocultar detalles" : "Ver detalles"}
                </button>
              </div>

              {expandedId === order.id && (
                <div className="mt-4 text-sm text-gray-800">
                  <p className="font-semibold mb-2">Productos:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {groupItems(order.saleProducts).map((g, idx) => (
                      <li key={idx}>
                        {g.name}
                        {g.variant && <span className="text-gray-500 ml-1">({g.variant})</span>}
                        {" "}- Cant. {g.qty} - Un. ${g.price.toFixed(2)} - Total: ${(g.price * g.qty).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
