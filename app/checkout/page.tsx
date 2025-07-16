'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { secureCreateSale } from '@/services/sales'
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { userEmail, userId } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>('shipping')
  const [shippingCost, setShippingCost] = useState<number | null>(null)

  const {
    inputValue,
    address,
    postalCode,
    suggestions,
    handleInputChange,
    handleSelectSuggestion,
  } = usePlacesAutocomplete()

  const totalCart = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const estimatedTotal =
    deliveryMethod === 'shipping' && shippingCost !== null
      ? totalCart + shippingCost
      : totalCart

  useEffect(() => {
    const fetchShippingCost = async () => {
      try {
        if (deliveryMethod === 'shipping' && address) {
          const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipping/estimate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, postalCode: postalCode || undefined }),
          })
          const data = await resp.json()
          if (data.cost !== undefined) {
            setShippingCost(data.cost)
          } else {
            setShippingCost(null)
          }
        } else {
          setShippingCost(null)
        }
      } catch {
        toast.error('Error al estimar el costo de envío')
        setShippingCost(null)
      }
    }
    fetchShippingCost()
  }, [address, postalCode, deliveryMethod])

  const handleTransfer = async () => {
    setIsLoading(true)
    try {
      if (deliveryMethod === 'shipping' && !address) {
        toast.error('Debés seleccionar una dirección de envío antes de continuar')
        setIsLoading(false)
        return
      }
      const token = localStorage.getItem('accessToken')!
      const res = await secureCreateSale(token, {
        userId: userId!,
        productIds: cart.map((i) => i.id),
        deliveryMethod,
        shippingAddress: deliveryMethod === 'shipping' ? address : undefined,
        postalCode: deliveryMethod === 'shipping' ? postalCode : undefined,
      })

      localStorage.setItem('justPurchased', 'true')
      localStorage.setItem('transferTotal', res.total.toString())
      toast.success('Compra registrada')
      router.push('/payment-transfer')
    } catch {
      toast.error('Error al registrar la compra')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMercadoPago = async () => {
    setIsLoading(true)
    try {
      if (deliveryMethod === 'shipping' && !address) {
        toast.error('Debés seleccionar una dirección antes de continuar')
        setIsLoading(false)
        return
      }
      const token = localStorage.getItem('accessToken')!
      const res = await secureCreateSale(token, {
        userId: userId!,
        productIds: cart.map((i) => i.id),
        deliveryMethod,
        shippingAddress: deliveryMethod === 'shipping' ? address : undefined,
        postalCode: deliveryMethod === 'shipping' ? postalCode : undefined,
      })

      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          cart: cart.map((item) => ({
            id: String(item.id),
            title: item.name,
            quantity: item.quantity,
            unit_price: item.price,
          })),
          total: res.total,
        }),
      })

      const data = await resp.json()
      if (data.url) {
        clearCart()
        window.location.href = data.url
      } else {
        toast.error('No se pudo iniciar pago con Mercado Pago.')
      }
    } catch {
      toast.error('Error al procesar con Mercado Pago')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Finalizar compra</h1>

      <h2 className="mb-2">Método de entrega</h2>
      <select
        value={deliveryMethod}
        onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'shipping')}
        className="border p-2 rounded mb-4"
      >
        {/* <option value="pickup">Retiro en local</option> */}
        <option value="shipping">Envío a domicilio</option>
      </select>

      {deliveryMethod === 'shipping' && (
        <>
          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Dirección"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="border bg-white rounded shadow mb-2 max-h-40 overflow-y-auto">
              {suggestions.map((sug, idx) => (
                <li
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectSuggestion(sug)}
                >
                  {sug.description}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Resumen de productos</h2>
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
              <p className="text-sm font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-right mt-4 mb-8">
        {deliveryMethod === 'shipping' && shippingCost !== null && (
          <p className="text-sm text-gray-600">Envío: ${shippingCost.toFixed(2)}</p>
        )}
        <p className="text-lg font-semibold">Total: ${estimatedTotal.toFixed(2)}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleMercadoPago}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded disabled:opacity-50"
        >
          {isLoading ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
        </button>
        <button
          onClick={handleTransfer}
          disabled={isLoading}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded"
        >
          {isLoading ? 'Procesando...' : 'Transferencia Bancaria'}
        </button>
      </div>
    </div>
  )
}
