"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHome() {
  const path = usePathname();

  const tabs = [
    { href: "/admin/categories", label: "Categorías", color: "blue" },
    { href: "/admin/products", label: "Productos", color: "blue" },
    { href: "/admin/carousel", label: "Carousel", color: "purple" },
    { href: "/admin/create-admin", label: "Crear Admin", color: "green" },
    { href: "/admin/sales", label: "Ventas", color: "red" },
  ];

  return (
    <nav className="bg-white shadow p-4 flex gap-4 flex-wrap">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-3 py-2 rounded ${path === tab.href ? `bg-${tab.color}-800` : `bg-${tab.color}-600`} text-white`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}