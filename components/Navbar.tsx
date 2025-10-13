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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b">
      {/* GRID 3 columnas: [logo] [centrado exacto: buscador] [acciones] */}
      <div
        className="
          mx-auto max-w-7xl px-4 sm:px-6 lg:px-8
          grid grid-cols-[auto_1fr_auto] gap-4
          h-14
        "
      >
        {/* Columna 1: Logo */}
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

        {/* Columna 2: Centro (buscador + links de navegación) */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-lg">
            <SearchBox />
          </div>
        </div>

        {/* Columna 3: Acciones (nav secundario + auth + carrito) */}
        <div className="flex items-center justify-end gap-5 text-gray-700">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            {isAuthenticated && userRole === "USER" && (
              <Link href="/my-orders" className="hover:underline">
                Mis compras
              </Link>
            )}
            <Link href="/" className="hover:underline">
              Tienda
            </Link>
            {isAuthenticated && userRole === "ADMIN" && (
              <Link href="/admin" className="hover:underline">
                Panel Admin
              </Link>
            )}
          </nav>

          {!isAuthenticated ? (
            <Link href="/login" className="flex items-center gap-1 hover:underline">
              <User className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Acceso</span>
            </Link>
          ) : (
            <>
              <span className="text-sm hidden sm:inline">Hola, {userFirstName}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1 hover:underline text-gray-700"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Cerrar sesión</span>
              </button>
            </>
          )}

          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toggleSidebar(true);
            }}
            className="flex items-center gap-1 hover:underline"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">${total.toFixed(2)}</span>
          </Link>
        </div>
      </div>

      {/* Buscador en mobile (opcional): visible bajo el header */}
      <div className="md:hidden px-4 sm:px-6 lg:px-8 pb-2 pt-2">
        <div className="w-full">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
