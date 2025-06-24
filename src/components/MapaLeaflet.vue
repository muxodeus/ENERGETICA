<template>
  <div id="map" style="height: 600px;"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { storeToRefs } from 'pinia'
import { useMeterStore } from '@/stores/meterStore'

// Iconos por estado
const iconColors = {
  Operativo: 'green',
  'En mantenimiento': 'orange',
  Desconectado: 'red'
}

const createIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${color}" stroke="black" stroke-width="1"/></svg>`,
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })

const meterStore = useMeterStore()
const { meters } = storeToRefs(meterStore)



onMounted(async () => {
  await meterStore.fetchMeters()

  const map = L.map('map').setView([13.693, -89.218], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  meters.value.forEach(m => {
    const icon = createIcon(iconColors[m.status] || 'gray')

    const marker = L.marker([m.lat, m.lng], { icon }).addTo(map)

const content = `
  <b>${m.name}</b><br />
  <b>Ubicación:</b> ${m.location}<br />
  <a href="/medidor/${m.id}">Ver detalles</a>
`
marker.bindPopup(content)

  })
})
</script>
