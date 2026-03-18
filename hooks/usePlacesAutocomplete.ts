'use client'

import { useRef, useState } from 'react'

// Tipo compatible con el checkout (usa sug.description)
export type PlaceSuggestion = {
  description: string
  placeId: string
  // Guardamos la referencia para poder hacer fetchFields después
  _placePrediction: google.maps.places.PlacePrediction
}

interface Return {
  inputValue: string
  setInputValue: (v: string) => void
  suggestions: PlaceSuggestion[]
  setSuggestions: (v: PlaceSuggestion[]) => void
  address: string
  setAddress: (v: string) => void
  postalCode: string
  setPostalCode: (v: string) => void
  handleInputChange: (val: string) => void
  handleSelectSuggestion: (pred: PlaceSuggestion) => Promise<void>
}

function newToken() {
  return new google.maps.places.AutocompleteSessionToken()
}

export function usePlacesAutocomplete(): Return {
  const [inputValue, setInputValue]   = useState('')
  const [address, setAddress]         = useState('')
  const [postalCode, setPostalCode]   = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])

  // Un mismo token agrupa búsqueda + detalle en una sola sesión de facturación
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  // Para cancelar requests en vuelo si el usuario sigue escribiendo
  const abortRef = useRef<AbortController | null>(null)

  function getToken() {
    if (!sessionTokenRef.current) sessionTokenRef.current = newToken()
    return sessionTokenRef.current
  }

  function refreshToken() {
    sessionTokenRef.current = newToken()
  }

  const handleInputChange = async (val: string) => {
    setInputValue(val)
    setAddress('')
    setPostalCode('')

    if (!val.trim()) {
      refreshToken()
      setSuggestions([])
      return
    }

    // Cancela request anterior
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    try {
      const { suggestions: raw } =
        await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: val,
          sessionToken: getToken(),
          includedRegionCodes: ['ar'],
          // Bias hacia CABA (radio 30 km)
          locationBias: {
            center: { lat: -34.6037, lng: -58.3816 },
            radius: 30_000,
          },
        })

      // La señal puede haber disparado antes de que llegue la respuesta
      if (signal.aborted) return

      const mapped: PlaceSuggestion[] = raw
        .filter(s => s.placePrediction !== null)
        .map(s => ({
          description: s.placePrediction!.text.text,
          placeId: s.placePrediction!.placeId,
          _placePrediction: s.placePrediction!,
        }))

      setSuggestions(mapped)
    } catch {
      // AbortError es esperado cuando el usuario sigue escribiendo; ignorar
      setSuggestions([])
    }
  }

  const handleSelectSuggestion = async (pred: PlaceSuggestion) => {
    setInputValue(pred.description)
    setAddress(pred.description)
    setSuggestions([])

    try {
      // toPlace() + fetchFields reemplaza PlacesService.getDetails()
      const place = pred._placePrediction.toPlace()
      await place.fetchFields({ fields: ['addressComponents'] })

      const cpComp = place.addressComponents?.find(c =>
        c.types.includes('postal_code'),
      )
      setPostalCode(cpComp?.longText ?? '')
    } catch {
      setPostalCode('')
    }

    // Renovar token para la próxima búsqueda independiente
    refreshToken()
  }

  return {
    inputValue,
    setInputValue,
    suggestions,
    setSuggestions,
    address,
    setAddress,
    postalCode,
    setPostalCode,
    handleInputChange,
    handleSelectSuggestion,
  }
}
