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
    <footer className="bg-[#f4f4f0] border-t border-[#e8e8e4] text-sm text-[#6b6b67]">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <p className="font-medium text-[#111110] mb-1.5">7M</p>
          <p className="text-[13px] leading-relaxed">
            Proveedor integral de productos de merchandising
          </p>
          <p className="mt-1.5 text-[12px] text-[#9b9b96]">
            Venta sólo a través de Partners
          </p>
        </div>

        {/* Empty middle col — reserved for future use */}
        <div />

        {/* Contact */}
        <div>
          <p className="font-medium text-[#111110] mb-3">Seguinos</p>
          <a
            href={ADMIN_CONTACT_INFO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] text-[#6b6b67] hover:text-[#111110] transition-colors mb-3"
          >
            <FaInstagram size={15} className="text-pink-500" />
            7M
          </a>
          <div className="space-y-1 text-[13px]">
            <p>
              <a
                href={`mailto:${ADMIN_CONTACT_INFO.email}`}
                className="hover:text-[#111110] transition-colors"
              >
                {ADMIN_CONTACT_INFO.email}
              </a>
            </p>
            <p>{ADMIN_CONTACT_INFO.phone}</p>
            <p className="text-[#9b9b96]">Lun–Vie · 9 a 18 hs.</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#e8e8e4] px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-[12px] text-[#9b9b96]">© {new Date().getFullYear()} 7M. Todos los derechos reservados.</p>
      </div>

      {/* WhatsApp flotante */}
      {showWhatsApp && (
        <a
          href={`https://wa.me/${ADMIN_CONTACT_INFO.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-lg transition-colors"
        >
          <FaWhatsapp size={22} />
        </a>
      )}
    </footer>
  );
}
