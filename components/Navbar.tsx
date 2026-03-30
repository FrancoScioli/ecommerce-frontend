"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import SearchBox from "./SearchBox";

export default function Navbar() {
  const { isAuthenticated, logout, userRole, userFirstName } = useAuth();
  const { total, toggleSidebar } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf8]/95 backdrop-blur-sm border-b border-[#e8e8e4]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-[auto_1fr_auto] gap-4 h-14">

        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logos/sieteMLogo.png"
              alt="Logo"
              width={125}
              height={55}
              priority
            />
          </Link>
        </div>

        {/* Buscador */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-lg">
            <SearchBox />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-1 text-[#111110]">
          <nav className="hidden md:flex items-center gap-1 mr-2">
            {isAuthenticated && userRole === "USER" && (
              <Link
                href="/my-orders"
                className="text-sm text-[#6b6b67] hover:text-[#111110] hover:bg-[#f4f4f0] px-3 py-1.5 rounded-lg transition-colors"
              >
                Mis compras
              </Link>
            )}
            <Link
              href="/"
              className="text-sm text-[#6b6b67] hover:text-[#111110] hover:bg-[#f4f4f0] px-3 py-1.5 rounded-lg transition-colors"
            >
              Tienda
            </Link>
            {isAuthenticated && userRole === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm text-[#6b6b67] hover:text-[#111110] hover:bg-[#f4f4f0] px-3 py-1.5 rounded-lg transition-colors"
              >
                Panel Admin
              </Link>
            )}
          </nav>

          {!isAuthenticated ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-[#6b6b67] hover:text-[#111110] hover:bg-[#f4f4f0] px-3 py-1.5 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Acceso</span>
            </Link>
          ) : (
            <>
              <span className="text-sm text-[#6b6b67] hidden sm:inline px-2">
                Hola, {userFirstName}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-[#6b6b67] hover:text-[#111110] hover:bg-[#f4f4f0] px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </>
          )}

          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); toggleSidebar(true); }}
            className="flex items-center gap-1.5 bg-[#111110] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#2a2a28] transition-colors ml-1"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">${total.toFixed(2)}</span>
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-2 pt-1">
        <SearchBox />
      </div>
    </header>
  );
}
