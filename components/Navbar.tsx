"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";


export default function Navbar() {
  const { isAuthenticated, logout, userRole, userFirstName } = useAuth();
  const { total, toggleSidebar } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/sieteMLogo.png"
            alt="Logo"
            width={125}
            height={55}
            priority
          />
        </Link>
        {/* Menú de navegación */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          {isAuthenticated && userRole === 'USER' && (
            <Link href="/my-orders" className="text-sm text-gray-700 hover:underline">
              Mis compras
            </Link>
          )}
          <Link href="/" className="hover:underline">
            Tienda
          </Link>
          {!isAuthenticated && (
            <Link href="/login" className="hover:underline">
              Acceso / Registro
            </Link>
          )}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-1 hover:underline text-gray-700"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Cerrar sesión</span>
            </button>
          )}
          {/* Link visible solo para admins */}
          {isAuthenticated && userRole === "ADMIN" && (
            <Link href="/admin" className="hover:underline">
              Panel Admin
            </Link>
          )}
        </nav>

        {/* Íconos (usuario, carrito, búsqueda) */}
        <div className="flex items-center gap-5 text-gray-700">
          {!isAuthenticated ? (
            <Link href="/login" className="flex items-center gap-1 hover:underline">
              <User className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Acceso</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden sm:inline">Hola, {userFirstName}</span>
            </div>
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
          {/* <Search className="w-5 h-5 cursor-pointer" /> */}
        </div>
      </div>
    </header>
  );
}
