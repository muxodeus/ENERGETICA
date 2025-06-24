<template>
  <div class="map-container" ref="mapContainer" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
// Import the Mapbox GL CSS so the map and markers are styled correctly
import 'mapbox-gl/dist/mapbox-gl.css'

const props = defineProps({
  meters: {
    type: Array,
    required: true
  },
  role: {
    type: String,
    default: 'visualizer'
  }
})

const mapContainer = ref(null)
let map = null

onMounted(() => {
  // Set your Mapbox access token
  mapboxgl.accessToken =
    'pk.eyJ1IjoibXV4b2RldXMiLCJhIjoiY2lsanBmZGxhNTN5a3ZybTByYjA1YWhqZSJ9.kspPh-wlVRf49UlMVbrDtA'

  // Initialize the map
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-89.19, 13.71], // Longitude, Latitude (centered around El Salvador)
    zoom: 7
  })

  // Add navigation controls (zoom and rotation)
  map.addControl(new mapboxgl.NavigationControl())

  // Wait for the map to load before adding markers
  map.on('load', () => {
    props.meters.forEach((meter) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>${meter.name}</strong><br/>
        Estado: ${meter.status}<br/>
        ${props.role === 'admin' ? '<button>Editar</button>' : ''}
      `)

      // Ensure lng and lat are in the correct order: [lng, lat]
      new mapboxgl.Marker({
        color: meter.status === 'activo' ? '#3bb2d0' : '#d9534f'
      })
        .setLngLat([meter.lng, meter.lat])
        .setPopup(popup)
        .addTo(map)
    })
  })
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  /* Ensure your container has a defined height – adjust as needed */
  height: calc(100vh - 60px);
}
</style>
