"use client"

import { useState, useRef } from "react"
import { toast } from "react-toastify"
import ReCAPTCHA from "react-google-recaptcha"
import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!

export default function CreateAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA | null>(null)
  const fetchWithRefresh = useFetchWithRefresh()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recaptchaToken = await recaptchaRef.current?.executeAsync()
    if (!recaptchaToken) {
      toast.error("Completa el reCAPTCHA")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("accessToken") || ""
      const res = await fetchWithRefresh(`${API}/auth/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role: "ADMIN",
          recaptchaToken,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Error al crear admin")
      }

      toast.success("Admin creado correctamente")
      setEmail("")
      setPassword("")
      setFirstName("")
      setLastName("")
    } catch {
      toast.error("Error al crear admin")
    } finally {
      recaptchaRef.current?.reset()
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl mb-4">Crear nuevo administrador</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Apellido</label>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear Admin"}
        </button>

        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          size="invisible"
        />
      </form>
    </div>
  )
}
