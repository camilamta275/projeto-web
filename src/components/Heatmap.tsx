'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

// REMOVIDO: import L from 'leaflet' (Isso causava o erro de window)

interface Props {
  data: [number, number, number][]
}

export default function Heatmap({ data }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null) // Trocado para any para evitar erro de tipo sem o import global
  const heatRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    let isMounted = true

    const init = async () => {
      // Carrega o Leaflet e o plugin apenas no cliente
      const L = (await import('leaflet')).default
      await import('leaflet.heat')

      if (!isMounted || !containerRef.current) return

      // Limpa container caso Next recrie
      containerRef.current.innerHTML = ''

      const map = L.map(containerRef.current).setView([-8.05, -34.9], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

      // @ts-ignore
      heatRef.current = L.heatLayer(data, { radius: 25 }).addTo(map)

      mapRef.current = map
    }

    init()

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Atualiza heatmap sem recriar mapa
  useEffect(() => {
    if (heatRef.current) {
      heatRef.current.setLatLngs(data)
    }
  }, [data])

  return (
    <div
      ref={containerRef}
      style={{ height: '300px', width: '100%' }}
    />
  )
}