declare module 'leaflet.heat' {
  import * as L from 'leaflet'

  export function heatLayer(
    latlngs: any[],
    options?: any
  ): L.Layer
}