'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { isAuthenticated, userId, userFirstName, userLastName, userEmail, userRole, accessToken } = useAuth()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    setNombre(`${userFirstName ?? ''} ${userLastName ?? ''}`.trim())
    setEmail(userEmail ?? '')
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.phone) setTelefono(data.phone) })
      .catch(() => null)
  }, [isAuthenticated, userFirstName, userLastName, userEmail, accessToken])

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleRealizarPedido = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !email.trim() || !telefono.trim()) {
      toast.error('Completá todos los campos antes de continuar')
      return
    }
    if (cart.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API}/sales/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: nombre.trim(),
          customerEmail: email.trim(),
          customerPhone: telefono.trim(),
          userId: userId ?? null,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            variant: item.variant,
          })),
        }),
      })

      if (!res.ok) throw new Error()

      clearCart()
      toast.success('¡Pedido realizado! Te enviaremos un email con el resumen.')
      router.push('/')
    } catch {
      toast.error('Error al realizar el pedido. Intentá nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-3 tracking-wide">FINALIZAR PEDIDO</h1>
      <p className="text-sm text-gray-600 mb-8 border-l-4 border-gray-300 pl-3">
        Una vez confirmado el pedido, nos pondremos en contacto con usted para coordinar
        método de pago y envío, el cual se cotizará por separado.
      </p>

      {/* Sección de autenticación */}
      {!isAuthenticated ? (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">
            ¿Tenés una cuenta? Iniciá sesión para agilizar el proceso.
          </p>
          <div className="flex gap-3">
            <Link
              href="/login?redirect=/checkout"
              className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register?redirect=/checkout"
              className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition"
            >
              Crear cuenta
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-3">O completá tus datos abajo para continuar como invitado.</p>
        </div>
      ) : userRole !== 'ADMIN' ? (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          Comprando como <span className="font-semibold">{userFirstName} {userLastName}</span>. Completá tu teléfono para finalizar.
        </div>
      ) : null}

      {/* Resumen de productos */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Resumen de productos</h2>
        <ul className="space-y-3">
          {cart.map((item) => (
            <li
              key={`${item.id}-${item.variant}`}
              className="flex items-center justify-between bg-gray-50 border rounded p-3"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="object-cover rounded"
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.variant && (
                    <p className="text-sm text-gray-500">Variante: {item.variant}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    x{item.quantity} — ${item.price.toFixed(2)} c/u
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </li>
          ))}
        </ul>
        <div className="text-right mt-4">
          <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
        </div>
      </div>

      {/* Datos de contacto */}
      <form onSubmit={handleRealizarPedido} className="space-y-4">
        <h2 className="text-lg font-semibold">Datos de contacto</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Nombre completo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="juan@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="+54 11 1234-5678"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || cart.length === 0}
          className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md text-sm font-semibold disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Enviando pedido…' : 'Realizar Pedido'}
        </button>
      </form>
    </div>
  )
}
