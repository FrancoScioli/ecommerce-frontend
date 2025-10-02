'use client'
import { useFetchWithRefresh } from '@/hooks/useFetchWithRefresh'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(false)
  const fetchWithRefresh = useFetchWithRefresh()

  const triggerSync = async (scope: 'all' | 'categories' | 'products' = 'all') => {
    try {
      setLoading(true)
      const res = await fetchWithRefresh(`${process.env.NEXT_PUBLIC_API_URL}/admin/zecat/sync?scope=${scope}`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('No se pudo iniciar la sincronización')
      const data = await res.json().catch(() => ({}))
      toast.success(data.message || 'Sincronización iniciada')
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message ?? 'Error al iniciar sincronización')
      } else {
        toast.error('Error al iniciar sincronización')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Integraciones · Zecat</h1>
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => triggerSync('all')} disabled={loading}>
          {loading ? 'Sincronizando…' : 'Sincronizar todo'}
        </button>
        <button className="px-4 py-2 bg-slate-100 rounded" onClick={() => triggerSync('categories')} disabled={loading}>
          Solo categorías
        </button>
        <button className="px-4 py-2 bg-slate-100 rounded" onClick={() => triggerSync('products')} disabled={loading}>
          Solo productos
        </button>
      </div>
    </section>
  )
}
