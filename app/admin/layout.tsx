"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && pathname === "/login") {
      if (userRole === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } else if (!isAuthenticated && !pathname.startsWith("/login")) {
      router.replace("/login");
    }
  }, [isAuthenticated, userRole, pathname, router]);

  // Evito recarga de la pantalla si no esta auth y no redirigio
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar administrativo */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col py-8 px-4">
        <h2 className="text-xl font-semibold mb-6">Panel Admin</h2>
        <nav className="flex flex-col gap-4">
          <Link
            href="/admin"
            className={`hover:underline ${pathname === "/admin" ? "font-bold" : ""
              }`}
          >
            Inicio
          </Link>
          <Link
            href="/admin/categories"
            className={`hover:underline ${pathname.startsWith("/admin/categories") ? "font-bold" : ""
              }`}
          >
            Categorías
          </Link>
          <Link
            href="/admin/products"
            className={`hover:underline ${pathname.startsWith("/admin/products") ? "font-bold" : ""
              }`}
          >
            Productos
          </Link>
          <Link
            href="/admin/carousel"
            className={`hover:underline ${pathname.startsWith("/admin/carousel") ? "font-bold" : ""
              }`}
          >
            Carousel principal
          </Link>
          <Link
            href="/admin/users"
            className={`hover:underline ${pathname.startsWith("/admin/users") ? "font-bold" : ""
              }`}
          >
            Administradores
          </Link>
          <Link
            href="/admin/sales"
            className={`hover:underline ${pathname.startsWith("/admin/sales") ? "font-bold" : ""}`}
          >
            Ventas
          </Link>
        </nav>
      </aside>

      {/* Contenido de cada subruta de /admin */}
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
