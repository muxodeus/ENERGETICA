<template>
  <div class="unifilar-wrapper">
    <h2>Diagrama Unifilar - Medidor {{ meterId }}</h2>
<svg viewBox="0 0 500 320" class="unifilar-diagram">
  <!-- Línea principal -->
  <line x1="50" y1="50" x2="450" y2="50" stroke="#222" stroke-width="4" />

  <!-- Interruptor central -->
  <circle cx="250" cy="50" r="12" :fill="isEnergized ? '#0f0' : '#aaa'">
    <animate v-if="isEnergized" attributeName="r" values="12;16;12" dur="1s" repeatCount="indefinite" />
  </circle>

  <!-- Carga A (izquierda) -->
  <line x1="150" y1="50" x2="150" y2="120" stroke="#444" stroke-width="3" />
  <rect
    x="130" y="120" width="40" height="40"
    :fill="cargaA_color"
  />
  <text x="150" y="150" text-anchor="middle" fill="#fff" font-size="11">Carga A</text>

  <!-- Carga B (derecha) -->
  <line x1="350" y1="50" x2="350" y2="120" stroke="#444" stroke-width="3" />
  <rect
    x="330" y="120" width="40" height="40"
    :fill="cargaB_color"
  />
  <text x="350" y="150" text-anchor="middle" fill="#fff" font-size="11">Carga B</text>

  <!-- Flechas animadas con animateTransform -->
  <g v-if="isEnergized">
    <text x="250" y="35" text-anchor="middle" fill="#0f0" font-size="18">
      <tspan>↓</tspan>
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 3; 0 0" dur="1s" repeatCount="indefinite" />
    </text>
    <text x="150" y="110" text-anchor="middle" fill="#0f0" font-size="16">
      <tspan>↓</tspan>
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 2; 0 0" dur="1s" repeatCount="indefinite" />
    </text>
    <text x="350" y="110" text-anchor="middle" fill="#0f0" font-size="16">
      <tspan>↓</tspan>
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 2; 0 0" dur="1s" repeatCount="indefinite" />
    </text>
  </g>
</svg>


    <div class="realtime-data">
      <p><b>Voltaje:</b> {{ voltaje ?? '—' }} V</p>
      <p><b>Corriente:</b> {{ corriente ?? '—' }} A</p>
      <p><b>Última lectura:</b> {{ timestamp ?? '—' }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const meterId = route.params.id
const cargaA_color = ref('#ff9800') // por defecto
const cargaB_color = ref('#03a9f4')

function fetchLiveData() {
  const v = Math.random() > 0.2 ? 220 : 0
  voltaje.value = v
  const corrienteRaw = v > 0 ? (Math.random() * 15).toFixed(2) : 0
  corriente.value = corrienteRaw
  isEnergized.value = v > 0
  timestamp.value = new Date().toLocaleTimeString()

  // Condiciones de color:
  cargaA_color.value = corrienteRaw > 10 ? '#f44336' : '#4caf50'
  cargaB_color.value = voltaje.value < 210 ? '#ffb300' : '#4caf50'
}


// Simulamos estado en tiempo real
const voltaje = ref(null)
const corriente = ref(null)
const timestamp = ref(null)
const isEnergized = ref(false)

onMounted(() => {
  fetchLiveData()
  setInterval(fetchLiveData, 5000)
})

</script>

<style scoped>
.unifilar-wrapper {
  padding: 2rem;
}

.unifilar-diagram {
  width: 100%;
  max-width: 400px;
  margin: 1rem auto;
  display: block;
  background: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.realtime-data {
  text-align: center;
  margin-top: 1rem;
  font-size: 1rem;
}
</style>
