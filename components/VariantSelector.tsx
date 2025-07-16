interface VariantOption {
  id: number;
  value: string;
}

interface Variant {
  id: number;
  name: string;
  options: VariantOption[];
}

interface VariantSelectorProps {
  variants: Variant[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function VariantSelector({
  variants,
  selected,
  onSelect,
}: VariantSelectorProps) {
  if (!variants.length) return null;

  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <div key={variant.id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{variant.name}</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
          >
            <option value="">Elegí una opción</option>
            {variant.options.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
    