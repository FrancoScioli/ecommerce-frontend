"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHome() {
  const path = usePathname();

  const tabs = [
    { href: "/admin/users", label: "Administradores", color: "blue" },
    { href: "/admin/price-markup", label: "Ajuste de precios", color: "red" },
    { href: "/admin/categories", label: "Categorías", color: "blue" },
    { href: "/admin/home", label: "Home", color: "purple" },
    { href: "/admin/import", label: "Importación", color: "green" },
    { href: "/admin/integrations", label: "Integraciones Zecat", color: "red" },
    { href: "/admin/products", label: "Productos", color: "blue" },
    { href: "/admin/sales", label: "Ventas", color: "red" },
  ];

  return (
    <nav className="bg-white shadow px-3 py-2 flex gap-1.5 flex-nowrap overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-2 py-1.5 rounded text-xs font-medium whitespace-nowrap ${path === tab.href ? `bg-${tab.color}-800` : `bg-${tab.color}-600`} text-white`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}