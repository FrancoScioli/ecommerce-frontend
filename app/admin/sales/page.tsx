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
  user: {
    id: number
    email: string
    phone: string | null
  }
  saleProducts: {
    product: {
      id: number
      name: string
      price: number
    }
  }[]
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null)
  const fetchWithRefresh = useFetchWithRefresh()

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_URL}/sales`)
        if (!res.ok) throw new Error('Error al cargar las ventas')
        const data: Sale[] = await res.json()
        setSales(data)
      } catch (err) {
        toast.error('Error al obtener ventas')
        console.error(err)
      }
    }

    fetchSales()
  }, [fetchWithRefresh])

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
                      {sale.saleProducts.map((sp, idx) => (
                        <li key={idx}>
                          {sp.product.name} - ${sp.product.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>

                    <p className="font-semibold mt-4">👤 Contacto del comprador:</p>
                    <div className="flex flex-col gap-1 ml-4">
                      {sale.user.phone && (
                        <a
                          href={buildWhatsAppLink(sale.user.phone, items)}
                          className="flex items-center gap-2 text-green-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaWhatsapp />
                          {sale.user.phone}
                        </a>
                      )}
                      <a
                        href={buildMailToLink(sale.user.email, items)}
                        className="flex items-center gap-2 text-blue-700 hover:underline"
                      >
                        <FiMail />
                        {sale.user.email}
                      </a>
                    </div>
                    <p className="font-semibold mt-4">🏠 Dirección de envío:</p>
                    <p className="ml-4 text-gray-700">
                      {sale.shippingAddress ?? 'Retiro en local'}
                      {sale.postalCode && ` — CP ${sale.postalCode}`}
                    </p>
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
