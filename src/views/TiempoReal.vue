<!-- src/views/TiempoReal.vue -->
<template>
  <div class="dashboard-tiempo-real">
    <h2>Tiempo Real – Medidor: {{ meterName }}</h2>

    <section class="custom-charts-section">
      <header class="custom-charts-header">
        <h3>Visualización Personalizada de Parámetros</h3>
        <div class="custom-controls">
          <Picklist
            v-model="selectedParam1"
            :options="availableParameters"
            label="Gráfico 1"
          />
          <Picklist
            v-model="selectedParam2"
            :options="availableParameters"
            label="Gráfico 2"
          />
          <Picklist
            v-model="selectedParam3"
            :options="availableParameters"
            label="Gráfico 3 (Conjunto)"
          />
          <Picklist
            v-model="selectedParam4"
            :options="availableParameters"
            label="Gráfico 4 (Conjunto)"
          />
          <button @click="resetCustomSeries">Actualizar Gráficos</button>
        </div>
      </header>

      <div class="custom-charts-container">
        <div class="chart-item custom-chart">
          <ApexChart
            :key="'custom1-'+selectedParam1"
            type="line"
            height="300"
            :options="customChart1Options"
            :series="customChart1Series"
          />
        </div>
        <div class="chart-item custom-chart">
          <ApexChart
            :key="'custom2-'+selectedParam2"
            type="line"
            height="300"
            :options="customChart2Options"
            :series="customChart2Series"
          />
        </div>
      </div>

      <div class="custom-charts-container">
        <div class="chart-item custom-chart">
          <ApexChart
            :key="'custom3-'+selectedParam3"
            type="line"
            height="300"
            :options="customChart3Options"
            :series="customChart3Series"
          />
        </div>
        <div class="chart-item custom-chart">
          <ApexChart
            :key="'custom4-'+selectedParam4"
            type="line"
            height="300"
            :options="customChart4Options"
            :series="customChart4Series"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import mqtt from 'mqtt'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Components
import Picklist  from '@/components/Picklist.vue'
import ApexChart from 'vue3-apexcharts'

// Route & Auth
const route = useRoute()
const auth  = useAuthStore()

// Meter name: ruta > store > ‘—’
const meterName = ref(
  route.params.meterName ||
  auth.selectedMeter?.name ||
  '—'
)

// Available parameters and their payload keys
const availableParameters = [
  { value: 'voltaje_A',       label: 'Voltaje A',       key: 'voltaje_A' },
  { value: 'corriente_A',     label: 'Corriente A',     key: 'corriente_A' },
  { value: 'potencia_total',  label: 'Potencia Total',  key: 'potencia_total' },
  { value: 'energia_total',   label: 'Energía Total',   key: 'energia_total' }
]

// Default picks
const selectedParam1 = ref('voltaje_A')
const selectedParam2 = ref('corriente_A')
const selectedParam3 = ref('potencia_total')
const selectedParam4 = ref('energia_total')

// Factory to create reactive series+options
function makeCustomSeries() {
  return {
    series: ref([{ name: '', data: [] }]),
    options: ref({
      chart: {
        id: 'custom-chart',
        animations: { enabled: true, dynamicAnimation: { speed: 1000 }, easing: 'linear' }
      },
      xaxis: { type: 'datetime' },
      title: { text: '' }
    })
  }
}

// Initialize four charts
const { series: customChart1Series, options: customChart1Options } = makeCustomSeries()
const { series: customChart2Series, options: customChart2Options } = makeCustomSeries()
const { series: customChart3Series, options: customChart3Options } = makeCustomSeries()
const { series: customChart4Series, options: customChart4Options } = makeCustomSeries()

// Reset titles & data
function resetCustomSeries() {
  const picks = [
    { sel: selectedParam1, series: customChart1Series, options: customChart1Options },
    { sel: selectedParam2, series: customChart2Series, options: customChart2Options },
    { sel: selectedParam3, series: customChart3Series, options: customChart3Options },
    { sel: selectedParam4, series: customChart4Series, options: customChart4Options }
  ]

  picks.forEach(({ sel, series, options }) => {
    const param = availableParameters.find(p => p.value === sel.value)
    // reset data & title
    series.value[0].data = []
    series.value[0].name = param.label
    options.value.title.text = param.label
  })
}

// Watch for pick changes and auto-reset
watch([selectedParam1, selectedParam2, selectedParam3, selectedParam4], resetCustomSeries, { immediate: true })

// MQTT client
let client = null

onMounted(() => {
  client = mqtt.connect(import.meta.env.VITE_MQTT_HOST, {
    username: import.meta.env.VITE_MQTT_USER,
    password: import.meta.env.VITE_MQTT_PASS,
    clientId: `tmr_${Math.random().toString(16).slice(2)}`,
    clean: true,
    keepalive: 60,
    reconnectPeriod: 2000
  })

  client.on('connect', () => {
    console.log('✅ MQTT conectado – TiempoReal')
    client.subscribe('energia/#', err => {
      if (err) console.error('❌ Suscripción fallida:', err)
    })
  })

  client.on('message', (topic, msg) => {
    // Update meterName if topic is energia/<meter>
    const parts = topic.split('/')
    if (parts[0] === 'energia' && parts[1]) {
      meterName.value = parts[1]
    }

    // Parse and dispatch data to each chart
    let payload = {}
    try { payload = JSON.parse(msg.toString()) }
    catch (e) { return console.error('JSON inválido:', msg.toString()) }

    const now = Date.now()
    ;[
      { sel: selectedParam1, series: customChart1Series },
      { sel: selectedParam2, series: customChart2Series },
      { sel: selectedParam3, series: customChart3Series },
      { sel: selectedParam4, series: customChart4Series }
    ].forEach(({ sel, series }) => {
      const key = availableParameters.find(p => p.value === sel.value)?.key
      const val = payload[key]
      if (val != null) {
        series.value[0].data.push({ x: now, y: val })
        if (series.value[0].data.length > 20)
          series.value[0].data.shift()
      }
    })
  })
})

onUnmounted(() => {
  if (client) {
    client.end()
    client = null
  }
})
</script>

<style scoped>
.dashboard-tiempo-real {
  padding: 1.5rem;
}
.custom-charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.custom-controls {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
.custom-charts-container {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
.custom-chart {
  flex: 1;
  background: #fff;
  padding: 1rem;
  border-radius: 4px;
}
button {
  padding: 0.4rem 0.8rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #115293;
}
</style>
