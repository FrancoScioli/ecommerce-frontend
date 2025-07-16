'use client'

import { useEffect, useRef, useState } from 'react'

export type GMapPrediction = google.maps.places.AutocompletePrediction & {
  place_id: string
}

interface Return {
  inputValue: string
  setInputValue: (v: string) => void
  suggestions: GMapPrediction[]
  setSuggestions: (v: GMapPrediction[]) => void
  address: string
  setAddress: (v: string) => void
  postalCode: string
  setPostalCode: (v: string) => void
  handleInputChange: (val: string) => void
  handleSelectSuggestion: (pred: GMapPrediction) => Promise<void>
}

export function usePlacesAutocomplete(): Return {
  const [inputValue, setInputValue] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [suggestions, setSuggestions] = useState<GMapPrediction[]>([])

  const autoServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)

  useEffect(() => {
    if (window.google && window.google.maps) {
      if (!autoServiceRef.current) {
        autoServiceRef.current = new google.maps.places.AutocompleteService()
      }
      if (!placesServiceRef.current) {
        const dummy = document.createElement('div')
        placesServiceRef.current = new google.maps.places.PlacesService(dummy)
      }
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
      }
    }
  }, [])

  const handleInputChange = (val: string) => {
    setInputValue(val)
    setAddress('')
    setPostalCode('')

    // reseteo token si el usuario borró todo
    if (val.trim() === '') {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
      setSuggestions([])
      return
    }

    if (!autoServiceRef.current) return

    autoServiceRef.current.getPlacePredictions(
      {
        input: val,
        componentRestrictions: { country: 'ar' },
        types: ['geocode'],
        locationBias: { radius: 30000, center: { lat: -34.6037, lng: -58.3816 } }, // CABA
        sessionToken: sessionTokenRef.current!,
      },
      async preds => {
        if (preds && preds.length) {
          setSuggestions(preds)
          return
        }

        try {
          const geoResp = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              val,
            )}&key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}`,
          ).then(r => r.json())

          const geocodePreds: GMapPrediction[] = (geoResp.results ?? []).map((r: google.maps.GeocoderResult) => ({
            description: r.formatted_address,
            place_id: r.place_id,
            matched_substrings: [],
            structured_formatting: {
              main_text: r.formatted_address,
              secondary_text: '',
              main_text_matched_substrings: [],
            },
            terms: [],
            types: ['geocode'],
          }))

          setSuggestions(geocodePreds)
        } catch {
          setSuggestions([])
        }
      },
    )
  }

  const fetchPostalCode = (placeId: string): Promise<string> => {
    return new Promise(resolve => {
      if (!placesServiceRef.current) return resolve('')

      placesServiceRef.current.getDetails(
        {
          placeId,
          fields: ['address_components'],
          sessionToken: sessionTokenRef.current!, // mismo token
        },
        place => {
          if (!place) return resolve('')

          const comp = place.address_components?.find(c =>
            c.types.includes('postal_code'),
          )
          resolve(comp?.long_name ?? '')
        },
      )
    })
  }

  const handleSelectSuggestion = async (pred: GMapPrediction) => {
    setInputValue(pred.description)
    setAddress(pred.description)
    setSuggestions([])

    const cp = await fetchPostalCode(pred.place_id)
    setPostalCode(cp)

    // renovamos token para la próxima búsqueda
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
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
