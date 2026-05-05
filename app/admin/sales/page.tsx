'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useFetchWithRefresh } from '@/hooks/useFetchWithRefresh'
import { toast } from 'react-toastify'
import { FiMail, FiShoppingBag } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

interface Sale {
  id: number
  total: number
  createdAt: string
  deliveryMethod: string
  shippingAddress: string | null
  postalCode: string | null
  shippingCost: number | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  user: {
    id: number
    email: string
    phone: string | null
  } | null
  saleProducts: {
    variant: string | null
    product: {
      id: number
      name: string
      price: number
    }
  }[]
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null)
  const [salesEmail, setSalesEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const fetchWithRefresh = useFetchWithRefresh()

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetchWithRefresh(`${API}/sales`)
        if (!res.ok) throw new Error('Error al cargar las ventas')
        const data: Sale[] = await res.json()
        setSales(data)
      } catch (err) {
        toast.error('Error al obtener ventas')
        console.error(err)
      }
    }

    const fetchConfig = async () => {
      try {
        const res = await fetchWithRefresh(`${API}/pricing-config`)
        if (!res.ok) return
        const data = await res.json()
        setSalesEmail(data.salesEmail ?? '')
      } catch {}
    }

    fetchSales()
    fetchConfig()
  }, [fetchWithRefresh])

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingEmail(true)
      const res = await fetchWithRefresh(`${API}/pricing-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesEmail }),
      })
      if (!res.ok) throw new Error()
      toast.success('Email guardado')
    } catch {
      toast.error('Error al guardar el email')
    } finally {
      setSavingEmail(false)
    }
  }

  const toggleDetails = (id: number) => {
    setExpandedSaleId(prev => (prev === id ? null : id))
  }

  const buildItemList = (sale: Sale) => {
    return sale.saleProducts.map(sp => sp.product.name).join(', ')
  }

  const buildWhatsAppLink = (phone: string, items: string) => {
    let normalizedPhone = phone.trim().replace(/\D/g, '')

    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = normalizedPhone.substring(1)
    }

    if (!normalizedPhone.startsWith('54')) {
      normalizedPhone = '54' + normalizedPhone
    }

    const text = `¡Hola! Te contacto de 7M por tu compra: *${items}*`
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`
  }


  const buildMailToLink = (email: string, items: string) => {
    const subject = 'Gracias por tu compra en 7M'
    const body = `¡Hola!\n\nGracias por tu compra en 7M. Te contacto por los productos que compraste:\n\n${items}\n\nSaludos.`
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section className="container mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Ventas</h1>

      {/* Email para envío de pedidos */}
      <div className="bg-white p-5 rounded-lg shadow max-w-lg">
        <h2 className="text-base font-semibold mb-3">Mail para envío de pedidos</h2>
        <p className="text-sm text-gray-500 mb-3">
          Al recibir un pedido, se enviará una copia a esta dirección de correo.
        </p>
        <form onSubmit={handleSaveEmail} className="flex gap-2">
          <input
            type="email"
            value={salesEmail}
            onChange={(e) => setSalesEmail(e.target.value)}
            placeholder="ventas@7m-merchandising.com"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={savingEmail}
            className="px-4 py-2 bg-black text-white text-sm rounded-md disabled:opacity-60"
          >
            {savingEmail ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </div>

      {sales.length === 0 ? (
        <p className="text-center text-gray-500">No hay ventas registradas.</p>
      ) : (
        <div className="space-y-4">
          {sales.map(sale => {
            const items = buildItemList(sale)

            return (
              <div key={sale.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <FiShoppingBag />
                      Venta #{sale.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Fecha: {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <p className="text-sm text-gray-600">Total: ${sale.total.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => toggleDetails(sale.id)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                  >
                    {expandedSaleId === sale.id ? 'Ocultar detalles' : 'Ver detalles'}
                  </button>
                </div>

                {expandedSaleId === sale.id && (
                  <div className="mt-4 space-y-2 text-sm text-gray-800">
                    <p className="font-semibold">📦 Productos:</p>
                    <ul className="list-disc list-inside ml-4">
                      {Object.values(
                        sale.saleProducts.reduce<Record<string, { name: string; variant: string | null; price: number; qty: number }>>(
                          (acc, sp) => {
                            const key = `${sp.product.id}__${sp.variant ?? ''}`
                            if (acc[key]) {
                              acc[key].qty++
                            } else {
                              acc[key] = { name: sp.product.name, variant: sp.variant, price: sp.product.price, qty: 1 }
                            }
                            return acc
                          },
                          {}
                        )
                      ).map((g, idx) => (
                        <li key={idx}>
                          {g.name}
                          {g.variant && (
                            <span className="text-gray-500 ml-1">({g.variant})</span>
                          )}
                          {' '}- Cant. {g.qty} - Un. ${g.price.toFixed(2)} - Total: ${(g.price * g.qty).toFixed(2)}
                        </li>
                      ))}
                    </ul>

                    <p className="font-semibold mt-4">👤 Contacto del comprador:</p>
                    <div className="flex flex-col gap-1 ml-4">
                      {/* Pedido guest (nuevo flujo) */}
                      {sale.customerName && (
                        <p className="text-gray-700">{sale.customerName}</p>
                      )}
                      {(sale.customerPhone ?? sale.user?.phone) && (
                        <a
                          href={buildWhatsAppLink((sale.customerPhone ?? sale.user?.phone)!, items)}
                          className="flex items-center gap-2 text-green-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaWhatsapp />
                          {sale.customerPhone ?? sale.user?.phone}
                        </a>
                      )}
                      {(sale.customerEmail ?? sale.user?.email) && (
                        <a
                          href={buildMailToLink((sale.customerEmail ?? sale.user?.email)!, items)}
                          className="flex items-center gap-2 text-blue-700 hover:underline"
                        >
                          <FiMail />
                          {sale.customerEmail ?? sale.user?.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
