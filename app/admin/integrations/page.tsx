'use client'

import { useFetchWithRefresh } from '@/hooks/useFetchWithRefresh'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function IntegrationsPage() {
  const [syncing, setSyncing] = useState(false)
  const [intervalHours, setIntervalHours] = useState<string>('1')
  const [savingInterval, setSavingInterval] = useState(false)
  const [detailSyncHour, setDetailSyncHour] = useState<string>('23')
  const [savingDetailHour, setSavingDetailHour] = useState(false)
  const fetchWithRefresh = useFetchWithRefresh()

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetchWithRefresh(`${API_BASE}/pricing-config`, { method: 'GET' })
        if (!res.ok) return
        const data = await res.json()
        setIntervalHours(String(data.zecatSyncIntervalHours ?? 1))
        setDetailSyncHour(String(data.zecatDetailSyncHour ?? 23))
      } catch {
        // silencioso
      }
    }
    loadConfig()
  }, [fetchWithRefresh])

  const triggerSync = async (scope: 'all' | 'categories' | 'products' | 'fast' = 'all') => {
    try {
      setSyncing(true)
      const res = await fetchWithRefresh(`${API_BASE}/admin/zecat/sync?scope=${scope}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('No se pudo iniciar la sincronización')
      const data = await res.json().catch(() => ({}))
      toast.success(data.message || 'Sincronización iniciada')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al iniciar sincronización')
    } finally {
      setSyncing(false)
    }
  }

  const handleSaveInterval = async (e: React.FormEvent) => {
    e.preventDefault()
    const numeric = Number(intervalHours)
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 48) {
      toast.error('El intervalo debe ser un número entero entre 1 y 48')
      return
    }
    try {
      setSavingInterval(true)
      const res = await fetchWithRefresh(`${API_BASE}/pricing-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zecatSyncIntervalHours: numeric }),
      })
      if (!res.ok) throw new Error(`Error del servidor (status ${res.status})`)
      toast.success('Intervalo guardado')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar el intervalo')
    } finally {
      setSavingInterval(false)
    }
  }

  const handleSaveDetailHour = async (e: React.FormEvent) => {
    e.preventDefault()
    const numeric = Number(detailSyncHour)
    if (![23, 0, 1, 2, 3, 4, 5].includes(numeric)) {
      toast.error('El horario debe estar entre las 23 hs y las 6 hs')
      return
    }
    try {
      setSavingDetailHour(true)
      const res = await fetchWithRefresh(`${API_BASE}/pricing-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zecatDetailSyncHour: numeric }),
      })
      if (!res.ok) throw new Error(`Error del servidor (status ${res.status})`)
      toast.success('Horario de personalización guardado')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar el horario')
    } finally {
      setSavingDetailHour(false)
    }
  }

  const hourOptions = [23, 0, 1, 2, 3, 4, 5]

  return (
    <section className="max-w-xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-4">Integraciones · Zecat</h1>

        <div className="flex gap-3 flex-wrap">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
            onClick={() => triggerSync('all')}
            disabled={syncing}
          >
            {syncing ? 'Sincronizando…' : 'Sincronizar todo'}
          </button>
          <button
            className="px-4 py-2 bg-slate-100 rounded text-sm disabled:opacity-60"
            onClick={() => triggerSync('categories')}
            disabled={syncing}
          >
            Solo categorías
          </button>
          <button
            className="px-4 py-2 bg-slate-100 rounded text-sm disabled:opacity-60"
            onClick={() => triggerSync('fast')}
            disabled={syncing}
          >
            Categorías + Productos
          </button>
          <button
            className="px-4 py-2 bg-slate-100 rounded text-sm disabled:opacity-60"
            onClick={() => triggerSync('products')}
            disabled={syncing}
          >
            Personalización (completo)
          </button>
        </div>
      </div>

      {/* Bloque 1: Categorías / Productos */}
      <div className="border-t border-gray-200 pt-6 space-y-3">
        <h2 className="text-base font-semibold">Sincronización automática — Categorías / Productos</h2>
        <p className="text-sm text-gray-600">
          Sincroniza categorías y productos genéricos (nombre, precio, stock, fotos comerciales).
          Al ejecutarse, primero sincroniza categorías y luego productos de forma inmediata.
        </p>

        <form onSubmit={handleSaveInterval} className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Intervalo (horas)</label>
            <input
              type="number"
              min={1}
              max={48}
              step={1}
              value={intervalHours}
              onChange={(e) => setIntervalHours(e.target.value)}
              className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              disabled={savingInterval || syncing}
            />
          </div>
          <button
            type="submit"
            disabled={savingInterval || syncing}
            className="px-4 py-2 rounded-md text-sm font-medium bg-black text-white disabled:opacity-60"
          >
            {savingInterval ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </div>

      {/* Bloque 2: Personalización de Productos */}
      <div className="border-t border-gray-200 pt-6 space-y-3">
        <h2 className="text-base font-semibold">Sincronización automática — Personalización de Productos</h2>
        <p className="text-sm text-gray-600">
          Sincroniza datos de personalización: fotos de variantes, técnicas de impresión,
          tiempo y costo de producción. Consulta el endpoint de detalle por cada producto.
        </p>

        <form onSubmit={handleSaveDetailHour} className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Hora de inicio</label>
            <select
              value={detailSyncHour}
              onChange={(e) => setDetailSyncHour(e.target.value)}
              className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              disabled={savingDetailHour || syncing}
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}:00 hs
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={savingDetailHour || syncing}
            className="px-4 py-2 rounded-md text-sm font-medium bg-black text-white disabled:opacity-60"
          >
            {savingDetailHour ? 'Guardando…' : 'Guardar'}
          </button>
        </form>

        <p className="text-xs text-gray-400">
          Por recomendación de Zecat, el horario para realizar la actualización automática será entre las 23 hs y las 6 hs.
        </p>
      </div>
    </section>
  )
}
