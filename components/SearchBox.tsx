'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFetchWithRefresh } from '@/hooks/useFetchWithRefresh'
import { FiSearch } from 'react-icons/fi'

type ProductHit = {
    id: number
    name: string
    price: number
    imageUrl?: string | null
    categoryName?: string | null
}
type CategoryHit = { id: number; name: string }
type SearchPayload = { products: ProductHit[]; categories: CategoryHit[] }

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function normalizeString(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function renderHighlight(text: string, query: string) {
    const normText = normalizeString(text)
    const normQuery = normalizeString(query).trim()
    if (!normQuery) return text

    const idx = normText.indexOf(normQuery)
    if (idx === -1) return text

    const start = idx
    const end = idx + normQuery.length
    return (
        <>
            {text.slice(0, start)}
            <mark className="bg-yellow-100 rounded px-0.5">{text.slice(start, end)}</mark>
            {text.slice(end)}
        </>
    )
}

type FlatLabel = { kind: 'label'; text: string }
type FlatProduct = { kind: 'product'; hit: ProductHit }
type FlatCategory = { kind: 'category'; hit: CategoryHit }
type FlatItem = FlatLabel | FlatProduct | FlatCategory

function isProductItem(it: FlatItem): it is FlatProduct {
    return it.kind === 'product'
}
function isCategoryItem(it: FlatItem): it is FlatCategory {
    return it.kind === 'category'
}

export default function SearchBox() {
    const router = useRouter()
    const fetchWithRefresh = useFetchWithRefresh()
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<SearchPayload>({ products: [], categories: [] })
    const [activeIndex, setActiveIndex] = useState<number>(-1)
    const debounced = useDebouncedValue(query, 200)
    const acRef = useRef<AbortController | null>(null)
    const rootRef = useRef<HTMLDivElement>(null)

    // Cerrar al clickear afuera
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return
            if (!rootRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [])

    // Buscar
    useEffect(() => {
        if (!debounced.trim()) {
            setData({ products: [], categories: [] })
            setOpen(false)
            return
        }
        acRef.current?.abort()
        const controller = new AbortController()
        acRef.current = controller

            ; (async () => {
                try {
                    setLoading(true)
                    const res = await fetchWithRefresh(
                        `${API}/public/search?q=${encodeURIComponent(debounced)}&limit=5`,
                        { signal: controller.signal }
                    )
                    const json = (await res.json()) as SearchPayload
                    setData(json)
                    setOpen(true)
                    setActiveIndex(-1)
                } catch {
                    // silencioso
                } finally {
                    setLoading(false)
                }
            })()

        return () => controller.abort()
    }, [debounced, fetchWithRefresh])

    const flatItems: FlatItem[] = useMemo(() => {
        const items: FlatItem[] = []
        if (data.products.length) {
            items.push({ kind: 'label', text: 'Productos' })
            data.products.forEach((hit) => items.push({ kind: 'product', hit }))
        }
        if (data.categories.length) {
            items.push({ kind: 'label', text: 'Categorías' })
            data.categories.forEach((hit) => items.push({ kind: 'category', hit }))
        }
        return items
    }, [data])

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!open || flatItems.length === 0) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            let next = activeIndex
            do {
                next = Math.min(flatItems.length - 1, next + 1)
            } while (flatItems[next]?.kind === 'label' && next < flatItems.length - 1)
            setActiveIndex(next)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            let prev = activeIndex
            do {
                prev = Math.max(0, prev - 1)
            } while (flatItems[prev]?.kind === 'label' && prev > 0)
            setActiveIndex(prev)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeIndex < 0) {
                router.push(`/tienda?query=${encodeURIComponent(query)}`)
                setOpen(false)
                return
            }
            const item = flatItems[activeIndex]
            if (!item || item.kind === 'label') return
            handleSelect(item)
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    function handleSelect(item: FlatProduct | FlatCategory) {
        if (isProductItem(item)) {
            const id = item.hit.id
            router.push(`/tienda/${id}`)
        } else router.push(`/tienda?category=${item.hit.id}`)

        setOpen(false)
    }

    return (
        <div className="relative w-full max-w-md" ref={rootRef}>
            <div className="flex items-center gap-2 rounded-full border px-3 py-2 bg-white">
                <FiSearch aria-hidden className="shrink-0" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => (query.trim() ? setOpen(true) : setOpen(false))}
                    onKeyDown={onKeyDown}
                    placeholder="Buscar productos o categorías…"
                    className="w-full outline-none bg-transparent"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls="search-autocomplete"
                />
            </div>

            {open && (data.products.length > 0 || data.categories.length > 0) && (
                <div
                    id="search-autocomplete"
                    role="listbox"
                    className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg overflow-auto max-h-80"
                >
                    {/* Productos */}
                    {data.products.length > 0 && (
                        <div className="py-1">
                            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Productos
                            </div>
                            {data.products.map((p) => {
                                const idx = flatItems.findIndex(
                                    (it) => isProductItem(it) && it.hit.id === p.id
                                )
                                const active = activeIndex === idx
                                return (
                                    <button
                                        key={p.id}
                                        role="option"
                                        aria-selected={active}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => handleSelect({ kind: 'product', hit: p })}
                                        className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 ${active ? 'bg-gray-100' : ''
                                            }`}
                                    >
                                        {p.imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-gray-200" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="truncate">{renderHighlight(p.name, query)}</div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {p.categoryName ? renderHighlight(p.categoryName, query) : '—'}
                                            </div>
                                        </div>
                                        <div className="ml-auto text-sm font-medium">${p.price}</div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Categorías */}
                    {data.categories.length > 0 && (
                        <div className="py-1 border-t">
                            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Categorías
                            </div>
                            {data.categories.map((c) => {
                                const idx = flatItems.findIndex(
                                    (it) => isCategoryItem(it) && it.hit.id === c.id
                                )
                                const active = activeIndex === idx
                                return (
                                    <button
                                        key={c.id}
                                        role="option"
                                        aria-selected={active}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => handleSelect({ kind: 'category', hit: c })}
                                        className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 ${active ? 'bg-gray-100' : ''
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded bg-gray-200" />
                                        <div className="truncate">{renderHighlight(c.name, query)}</div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {loading && (
                        <div className="px-3 py-2 text-sm text-gray-500 border-t">Buscando…</div>
                    )}
                </div>
            )}
        </div>
    )
}
