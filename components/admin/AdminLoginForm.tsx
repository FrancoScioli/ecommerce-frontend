"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ModalMessage from "@/components/ui/ModalMessage"
import { useAuth } from "@/context/AuthContext"

export default function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [modal, setModal] = useState<{
    open: boolean
    message: string
    type: "success" | "error"
  }>({ open: false, message: "", type: "success" })
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        setModal({ open: true, message: "Credenciales inválidas", type: "error" })
        return
      }

      const { access_token, refresh_token } = await res.json()
      // Guardar ambos tokens y actualizar contexto
      login(access_token, refresh_token)

      setModal({ open: true, message: "Inicio de sesión exitoso", type: "success" })
      setEmail("")
      setPassword("")

      // redirige tras un breve delay para que el usuario vea el modal
      setTimeout(() => {
        router.replace("/admin") 
      }, 500)
    } catch {
      setModal({ open: true, message: "Error de red, inténtalo de nuevo", type: "error" })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow space-y-4">
        <ModalMessage
          open={modal.open}
          message={modal.message}
          type={modal.type}
          onClose={() => setModal(prev => ({ ...prev, open: false }))}
        />

        <h2 className="text-xl font-semibold text-center">Admin Login</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  )
}
