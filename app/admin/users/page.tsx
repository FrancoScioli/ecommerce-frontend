import Link from "next/link";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestionar Administradores</h1>
      {/* <p>
        Aquí podrás ver la lista de administradores y agregar nuevos admins.
        Esta funcionalidad estará disponible próximamente.
      </p> */}
      <Link
        href="/admin/create-admin"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
      >
        Agregar Nuevo Admin
      </Link>
    </div>
  );
}
