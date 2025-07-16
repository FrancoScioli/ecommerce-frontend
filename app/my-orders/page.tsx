"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  saleProducts: {
    product: {
      id: number;
      name: string;
      price: number;
    };
  }[];
}

export default function MyOrdersPage() {
  const { userId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al cargar pedidos");

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        toast.error("No se pudieron cargar tus compras");
        console.error(err)
      }
    };

    if (userId) fetchOrders();
  }, [userId]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Mis compras</h1>
      {orders.length === 0 ? (
        <p>No tenés compras registradas.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map(order => (
            <li key={order.id} className="border p-4 rounded shadow-sm bg-white">
              <p className="mb-1"><strong>ID:</strong> {order.id}</p>
              <p className="mb-1"><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <p className="mb-1"><strong>Estado:</strong> {order.status}</p>
              <p className="mb-2"><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              <div>
                <strong>Productos:</strong>
                <ul className="list-disc list-inside">
                  {order.saleProducts.map(sp => (
                    <li key={sp.product.id}>{sp.product.name} - ${sp.product.price.toFixed(2)}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
