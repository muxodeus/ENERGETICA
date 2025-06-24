<template>
  <div id="map" style="height: 600px;"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

onMounted(() => {
  const map = L.map('map').setView([13.6929, -89.2182], 13) // Ejemplo: San Salvador

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  // Ejemplo: marcador para un medidor
  const marker = L.marker([13.6929, -89.2182]).addTo(map)
  marker.bindPopup('<b>Medidor activo</b><br />Planta principal.').openPopup()
})
</script>
