"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";

type PricingConfig = {
    providerMarkupPercent: string | number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PriceMarkupPage() {
    const fetchWithRefresh = useFetchWithRefresh();
    const [markup, setMarkup] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                setLoading(true);

                const url = `${API_BASE}/pricing-config`;
                const res = await fetchWithRefresh(url, { method: "GET" });

                if (!res.ok) {
                    throw new Error(`No se pudo obtener la configuración (status ${res.status})`);
                }

                const data = (await res.json()) as PricingConfig;

                const value = data.providerMarkupPercent ?? 0;
                setMarkup(String(value));
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar la configuración de precios");
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [fetchWithRefresh]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numeric = Number(markup);
        if (Number.isNaN(numeric)) {
            toast.error("Ingresá un número válido");
            return;
        }
        if (numeric < 0 || numeric > 100) {
            toast.error("El recargo debe estar entre 0% y 100%");
            return;
        }

        try {
            setLoading(true);

            const url = `${API_BASE}/pricing-config`;
            const res = await fetchWithRefresh(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    providerMarkupPercent: numeric,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error("Error respuesta PATCH /pricing-config:", body);
                throw new Error(`Error en el servidor (status ${res.status})`);
            }

            toast.success("Ajuste de precios actualizado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Hubo un problema al guardar el recargo");
        } finally {
            setLoading(false);
        }
    };

    const handleFullSync = async () => {
        try {
            setSyncing(true);
            const url = `${API_BASE}/admin/zecat/sync?scope=products`;

            const res = await fetchWithRefresh(url, { method: "POST" });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error("Error respuesta POST /admin/zecat/sync?scope=products", body);
                throw new Error(`Error en el servidor (status ${res.status})`);
            }

            toast.success("Sincronización Zecat ejecutada. Los precios fueron actualizados.");
        } catch (error) {
            console.error(error);
            toast.error("Error al ejecutar la sincronización de Zecat");
        } finally {
            setSyncing(false);
        }
    };

    const markupNumber = Number(markup || 0);
    const factorMarkup = 1 + (isNaN(markupNumber) ? 0 : markupNumber / 100);
    const factorIva = 1.21;
    const factorTotal = factorMarkup * factorIva;

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-xl font-semibold mb-4">Ajuste de precios</h1>

            <p className="text-sm text-gray-600 mb-2">
                Configurá el porcentaje de <span className="font-medium">recargo</span>{" "}
                que se aplicará sobre el precio del proveedor.
            </p>
            <p className="text-sm text-gray-600 mb-4">
                Además del recargo, el sistema aplica siempre{" "}
                <span className="font-semibold">21% de IVA</span> al precio final.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Porcentaje de recargo (%)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={markup}
                        onChange={(e) => setMarkup(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        disabled={loading || syncing}
                    />
                </div>

                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 space-y-1">
                    <p className="font-semibold">Cómo se calcula el precio final:</p>
                    <p>
                        <code>
                            precioFinal = precioProveedor × (1 + recargo/100) × 1.21
                        </code>
                    </p>
                    <p className="mt-1">
                        Con el recargo actual ({isNaN(markupNumber) ? 0 : markupNumber}
                        %), un producto de{" "}
                        <span className="font-mono">$ 100.00</span> del proveedor quedaría
                        aprox. en{" "}
                        <span className="font-mono">
                            $
                            {Number.isFinite(factorTotal)
                                ? (100 * factorTotal).toFixed(2)
                                : "0.00"}
                        </span>{" "}
                        para el cliente.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || syncing}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-transparent bg-black text-white disabled:opacity-60"
                >
                    {loading ? "Guardando..." : "Guardar cambios"}
                </button>
            </form>

            <div className="border-t border-gray-200 pt-4">
                <h2 className="text-sm font-semibold mb-2">
                    Aplicar el recargo a los productos Zecat
                </h2>
                <p className="text-xs text-gray-600 mb-3">
                    Para actualizar los precios de todos los productos provenientes de Zecat
                    con el nuevo recargo y el IVA, ejecutá una sincronización completa.
                </p>
                <button
                    type="button"
                    onClick={handleFullSync}
                    disabled={syncing || loading}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-60"
                >
                    {syncing ? "Sincronizando Zecat..." : "Re-sincronizar productos Zecat"}
                </button>
            </div>
        </div>
    );
}
