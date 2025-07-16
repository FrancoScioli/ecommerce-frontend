"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

  const normalizePhone = (raw: string) => {
    return raw.replace(/\D/g, "") // elimina todo lo que no sea número
      .replace(/^0/, "")          // quita el 0 inicial
      .replace(/^54/, "")         // si ya tiene 54, lo quitamos para evitar duplicar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 10) {
      toast.error("Número de teléfono inválido. Ej: 11 1234 5678");
      return;
    }

    const token = await recaptchaRef.current?.executeAsync();
    if (!token) {
      toast.error("Completa el reCAPTCHA");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          phone: cleanPhone,
          firstName,
          lastName,
          recaptcha: token,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return toast.error(err?.message || "Error al registrar");
      }

      toast.success("Registro exitoso. Ya puedes iniciar sesión");
      router.push("/login");
    } catch (err) {
      toast.error("Ocurrió un error inesperado");
      console.error(err);
    } finally {
      recaptchaRef.current?.reset();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl mb-4">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Nombre</label>
          <input
            type="text"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
        </div>
        <div>
          <label className="block text-sm">Apellido</label>
          <input
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Teléfono (sin 0 ni +54)</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            placeholder="Ej: 11 1234 5678"
            pattern="[0-9 ]{6,15}"
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Confirmar Contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
        >
          {isSubmitting ? "Registrando..." : "Registrarse"}
        </button>

        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          size="invisible"
        />
      </form>
    </div>
  );
}
