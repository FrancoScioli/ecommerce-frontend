"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function PerfilPage() {
  const { isAuthenticated, accessToken } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login?redirect=/perfil"); return; }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => {
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setPhone(data.phone ?? "");
      })
      .catch(() => toast.error("Error al cargar el perfil"))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, accessToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setIsSaving(true);
    try {
      const body: Record<string, string> = { firstName, lastName, phone };
      if (password) body.password = password;

      const res = await fetch(`${API}/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Datos actualizados correctamente");
      setPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="container mx-auto px-4 py-10">Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+54 11 1234-5678"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <hr className="my-2" />
        <p className="text-sm text-gray-500">Dejá en blanco para no cambiar la contraseña</p>

        <div>
          <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-black text-white py-2.5 rounded-md text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
