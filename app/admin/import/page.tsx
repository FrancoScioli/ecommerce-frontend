"use client";

import { useRef, useState } from "react";
import { useFetchWithRefresh } from "@/hooks/useFetchWithRefresh";
import { toast } from "react-toastify";
import { UploadCloud, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchWithRefresh = useFetchWithRefresh();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Solo se aceptan archivos Excel (.xlsx o .xls)");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetchWithRefresh(`${API}/import/products`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Error en la importación");
      }
      const data: ImportResult = await res.json();
      setResult(data);
      if (data.created > 0) toast.success(`${data.created} productos importados ✅`);
      else toast.warn("No se importaron productos. Revisá los errores.");
    } catch (err: any) {
      toast.error(err.message || "Error al importar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">Importación de Productos</h1>

      {/* Upload section */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold text-lg">Cargar archivo Excel</h2>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-black transition"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) {
              if (!f.name.match(/\.(xlsx|xls)$/i)) { toast.error("Solo archivos Excel (.xlsx, .xls)"); return; }
              setFile(f);
              setResult(null);
            }
          }}
        >
          <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          {file ? (
            <p className="text-sm font-medium text-gray-800">{file.name}</p>
          ) : (
            <p className="text-sm text-gray-500">
              Arrastrá un archivo Excel aquí o <span className="underline">hacé click para seleccionar</span>
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleFileChange}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-md text-sm font-semibold disabled:opacity-50 hover:bg-gray-800 transition"
        >
          <UploadCloud className="w-4 h-4" />
          {loading ? "Importando…" : "Importar productos"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg border p-6 space-y-3">
          <h2 className="font-semibold text-lg">Resultado</h2>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span><strong>{result.created}</strong> productos creados</span>
            </div>
            {result.skipped > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                <span><strong>{result.skipped}</strong> omitidos</span>
              </div>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-600 mb-2">Errores:</p>
              <ul className="text-xs text-red-500 space-y-1 max-h-48 overflow-y-auto bg-red-50 rounded p-3">
                {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Format documentation */}
      <div className="bg-white rounded-lg border p-6 space-y-4 text-sm">
        <h2 className="font-semibold text-lg">Formato del archivo Excel</h2>
        <p className="text-gray-600">
          El archivo debe tener una única hoja con los siguientes encabezados en la primera fila:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left font-semibold">Columna</th>
                <th className="border px-3 py-2 text-left font-semibold">Obligatorio</th>
                <th className="border px-3 py-2 text-left font-semibold">Descripción</th>
                <th className="border px-3 py-2 text-left font-semibold">Ejemplo</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr>
                <td className="border px-3 py-2 font-mono font-bold">nombre</td>
                <td className="border px-3 py-2 text-green-700 font-medium">Sí</td>
                <td className="border px-3 py-2">Nombre del producto</td>
                <td className="border px-3 py-2 text-gray-500">Bolígrafo Premium</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border px-3 py-2 font-mono font-bold">descripcion</td>
                <td className="border px-3 py-2 text-green-700 font-medium">Sí</td>
                <td className="border px-3 py-2">Descripción del producto</td>
                <td className="border px-3 py-2 text-gray-500">Bolígrafo metálico de alta calidad</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-mono font-bold">precio</td>
                <td className="border px-3 py-2 text-green-700 font-medium">Sí</td>
                <td className="border px-3 py-2">Precio en pesos, sin símbolos</td>
                <td className="border px-3 py-2 text-gray-500">1500.00</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border px-3 py-2 font-mono font-bold">categoria</td>
                <td className="border px-3 py-2 text-green-700 font-medium">Sí</td>
                <td className="border px-3 py-2">Nombre de la categoría. Si no existe, se crea automáticamente.</td>
                <td className="border px-3 py-2 text-gray-500">Bolígrafos</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-mono font-bold">sku</td>
                <td className="border px-3 py-2 text-gray-400">No</td>
                <td className="border px-3 py-2">Código de referencia interno o del proveedor</td>
                <td className="border px-3 py-2 text-gray-500">BOL-001</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border px-3 py-2 font-mono font-bold">activo</td>
                <td className="border px-3 py-2 text-gray-400">No</td>
                <td className="border px-3 py-2">SI para publicar, NO para ocultar. Por defecto: SI.</td>
                <td className="border px-3 py-2 text-gray-500">SI</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-mono font-bold">variantes</td>
                <td className="border px-3 py-2 text-gray-400">No</td>
                <td className="border px-3 py-2">
                  Grupos de variantes separados por <code className="bg-gray-100 px-1">|</code>.
                  Cada grupo: <code className="bg-gray-100 px-1">Nombre:Opcion1,Opcion2</code>
                </td>
                <td className="border px-3 py-2 text-gray-500">Color:Rojo,Azul,Negro|Talle:S,M,L</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border px-3 py-2 font-mono font-bold">imagenes</td>
                <td className="border px-3 py-2 text-gray-400">No</td>
                <td className="border px-3 py-2">URLs públicas de imágenes, separadas por coma.</td>
                <td className="border px-3 py-2 text-gray-500 break-all">https://sitio.com/img1.jpg,https://sitio.com/img2.jpg</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-3 text-gray-600 mt-2">
          <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-1">
            <p className="font-semibold text-amber-800">Variantes — formato detallado</p>
            <p>Cada grupo de variante se separa con <code className="bg-white border px-1 rounded">|</code> y sus opciones con <code className="bg-white border px-1 rounded">,</code></p>
            <p className="font-mono text-xs bg-white border rounded px-2 py-1 mt-1">
              Color:Rojo,Azul,Verde|Talle:S,M,L,XL
            </p>
            <p className="text-xs mt-1">Esto crea 2 grupos de variantes: <em>Color</em> (3 opciones) y <em>Talle</em> (4 opciones).</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-1">
            <p className="font-semibold text-blue-800">Imágenes — cómo cargarlas</p>
            <p className="text-xs">Las imágenes deben estar <strong>publicadas en internet</strong> con una URL pública accesible. Opciones:</p>
            <ul className="text-xs list-disc list-inside space-y-0.5 mt-1">
              <li>Subidas previamente en Google Drive (con link de descarga directa)</li>
              <li>Hosted en Imgur, Cloudinary u otro servicio de imágenes</li>
              <li>Tras la importación, podés reemplazar imágenes desde el panel de Productos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
