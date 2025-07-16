"use client";

import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ADMIN_CONTACT_INFO } from "@/constants/constants";




export default function Footer() {
  const pathname = usePathname();
  const hideOnRoutes = ["/login", "/register", "/admin/create-admin"];
  const { isOpen } = useCart();
  const showWhatsApp = !hideOnRoutes.includes(pathname) && !isOpen;


  return (
    <footer className="bg-white border-t mt-20 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="font-bold mb-2">7M</h2>
          <p>Proveedor integral de productos de merchandising</p>
          <p className="mt-2 text-xs">Venta sólo a través de Partners</p>
        </div>

        <div>
          {/* <h3 className="font-semibold mb-2">Sumate a nuestro newsletter</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex"
          >
            <input
              type="email"
              placeholder="Tu email"
              required
              className="border px-2 py-1 w-full"
            />
            <button
              type="submit"
              className="bg-black text-white px-4 hover:bg-gray-800"
            >
              Enviar
            </button>
          </form> */}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Seguinos</h3>
          <div className="flex space-x-4 text-pink-500 mb-2">
            <a href={ADMIN_CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram size={20} /></a>
          </div>
          <div className="text-sm text-gray-600">
            <p><a href={`mailto:${ADMIN_CONTACT_INFO.email}`}>{ADMIN_CONTACT_INFO.email}</a></p>
            <p>{ADMIN_CONTACT_INFO.phone}</p>
            <p>Atencion: Lunes a viernes de 9 a 18 hs.</p>
          </div>
        </div>
      </div>

      {/* Botón flotante de WhatsApp */}
      {showWhatsApp ? (
        <a
          href={`https://wa.me/${ADMIN_CONTACT_INFO.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg"
        >
          <FaWhatsapp size={24} />
        </a>
      ) : null}
    </footer>
  );
}
