"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import SearchBox from "./SearchBox";
import { useEffect, useRef, useState } from "react";

interface NavCategory {
  id: number;
  name: string;
}

export default function Navbar() {
  const { isAuthenticated, logout, userRole, userFirstName } = useAuth();
  const { total, toggleSidebar } = useCart();
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`)
      .then((r) => r.json())
      .then((data: NavCategory[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b">
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

        {/* Columna 2: Buscador */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-lg">
            <SearchBox />
          </div>
        </div>

        {/* Columna 3: Nav + auth + carrito */}
        <div className="flex items-center justify-end gap-5 text-gray-700">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            {isAuthenticated && userRole === "USER" && (
              <Link href="/my-orders" className="hover:underline">
                Mis compras
              </Link>
            )}

            {/* Dropdown Productos */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1 hover:underline focus:outline-none"
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <Link href="/tienda" onClick={() => setDropdownOpen(false)}>
                  Productos
                </Link>
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && categories.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 flex flex-col">
                  <Link
                    href="/tienda"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-100 shrink-0"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Ver todos
                  </Link>
                  <div className="overflow-y-auto max-h-72">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/tienda?category=${cat.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

      {/* Buscador mobile */}
      <div className="md:hidden px-4 sm:px-6 lg:px-8 pb-2 pt-2">
        <div className="w-full">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
