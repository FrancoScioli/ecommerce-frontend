"use client";

import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  path: Crumb[];
}

export default function Breadcrumbs({ path }: BreadcrumbsProps) {
  return (
    <nav className="text-sm text-gray-500">
      <ol className="list-none p-0 inline-flex space-x-1">
        {path.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {crumb.href ? (
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-700">{crumb.label}</span>
            )}
            {index < path.length - 1 && <span className="mx-2">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
