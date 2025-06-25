<!-- src/components/MedidorBombaAgua.vue -->
<template>
  <div>
    <h2>Medidor Bomba de Agua</h2>

    <div class="chart-container">
      <!-- Voltaje -->
      <div class="chart-block">
        <h3>Voltaje A (V)</h3>
        <apexchart
          ref="chartVoltaje"
          type="line"
          height="300"
          :options="optionsVoltaje"
          :series="seriesVoltaje"
        />
        <div class="stats-row">
          <div class="stat-item"><strong>Min:</strong> {{ statsVoltaje.min }}</div>
          <div class="stat-item"><strong>Max:</strong> {{ statsVoltaje.max }}</div>
          <div class="stat-item"><strong>Prom:</strong> {{ statsVoltaje.avg }}</div>
          <div class="stat-item"><strong>Percentil 5:</strong> {{ statsVoltaje.p5 }}</div>
          <div class="stat-item"><strong>Percentil 95:</strong> {{ statsVoltaje.p95 }}</div>
        </div>
      </div>

      <!-- Corriente -->
      <div class="chart-block">
        <h3>Corriente A (A)</h3>
        <apexchart
          ref="chartCorriente"
          type="line"
          height="300"
          :options="optionsCorriente"
          :series="seriesCorriente"
        />
        <div class="stats-row">
          <div class="stat-item"><strong>Min:</strong> {{ statsCorriente.min }}</div>
          <div class="stat-item"><strong>Max:</strong> {{ statsCorriente.max }}</div>
          <div class="stat-item"><strong>Prom:</strong> {{ statsCorriente.avg }}</div>
          <div class="stat-item"><strong>Percentil 5:</strong> {{ statsCorriente.p5 }}</div>
          <div class="stat-item"><strong>Percentil 95:</strong> {{ statsCorriente.p95 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt'
import ApexChart from 'vue3-apexcharts'

const BROKER_URL = import.meta.env.VITE_MQTT_HOST
const MQTT_USER  = import.meta.env.VITE_MQTT_USER
const MQTT_PASS  = import.meta.env.VITE_MQTT_PASS

export default {
  name: 'MedidorBombaAgua',
  components: { apexchart: ApexChart },

  data() {
    const intervalSec = 3
    const windowSize  = Math.ceil(10 * 60 / intervalSec) // → 200 puntos

    return {
      // Ventana de datos
      windowSize,
      // series para cada gráfica
      seriesVoltaje:  [{ name: 'Voltaje A',  data: [] }],
      seriesCorriente:[{ name: 'Corriente A', data: [] }],
      // opciones de ApexCharts
      optionsVoltaje: {
        chart: { id: 'voltaje-chart', animations: { enabled: true } },
        xaxis: { type: 'category', title: { text: 'Hora' } },
        yaxis: { title: { text: 'Voltios (V)' } },
        stroke: { curve: 'smooth' },
        tooltip: { x: { format: 'HH:mm:ss' } }
      },
      optionsCorriente: {
        chart: { id: 'corriente-chart', animations: { enabled: true } },
        xaxis: { type: 'category', title: { text: 'Hora' } },
        yaxis: { title: { text: 'Amperios (A)' } },
        stroke: { curve: 'smooth' },
        tooltip: { x: { format: 'HH:mm:ss' } }
      },
      // arrays brutos para cálculo de estadísticas
      rawVoltaje:   [],
      rawCorriente: []
    }
  },

  computed: {
    statsVoltaje() {
      return this.calcStats(this.rawVoltaje, 2)
    },
    statsCorriente() {
      return this.calcStats(this.rawCorriente, 3)
    }
  },

  methods: {
    calcStats(arr, dec) {
      if (arr.length === 0) {
        return { min: 0, max: 0, avg: 0, p5: 0, p95: 0 }
      }
      const sorted = [...arr].sort((a, b) => a - b)
      const n      = sorted.length
      const sum    = sorted.reduce((s, v) => s + v, 0)
      const avg    = sum / n
      const percentile = p =>
        sorted[Math.min(n - 1, Math.floor(p * n))]
      const fmt = v => v.toFixed(dec)
      return {
        min:  fmt(sorted[0]),
        max:  fmt(sorted[n - 1]),
        avg:  fmt(avg),
        p5:   fmt(percentile(0.05)),
        p95:  fmt(percentile(0.95))
      }
    }
  },

  mounted() {
    const client = mqtt.connect(BROKER_URL, {
      clientId:        'front_bomba_vue_' + Math.random().toString(16).slice(2),
      clean:           false,
      keepalive:       60,
      reconnectPeriod: 1000,
      connectTimeout:  30_000,
      resubscribe:     true,
      queueQoSZero:    true,
      username:        MQTT_USER,
      password:        MQTT_PASS
    })

    client.on('connect', () => {
      console.log('✅ MQTT conectado – sesión persistida')
      client.subscribe('energia/BOMBA_AGUA', err => {
        if (!err) console.log('– Suscrito a energia/BOMBA_AGUA')
      })
    })
    client.on('reconnect', () =>
      console.log('🔄 MQTT reintentando conexión')
    )
    client.on('offline', () =>
      console.warn('⚠️ MQTT offline, esperando reconnect…')
    )
    client.on('error', e =>
      console.error('❌ MQTT error', e)
    )

    client.on('message', (_, msg) => {
      const payload = JSON.parse(msg.toString())
      const ts      = new Date(payload.timestamp * 1000)
                        .toLocaleTimeString()

      // ── Voltaje ───────────────────────────────────────────────
      this.rawVoltaje.push(payload.voltaje_A)
      this.rawVoltaje = this.rawVoltaje.slice(-this.windowSize)
      const vData = [
        ...this.seriesVoltaje[0].data,
        { x: ts, y: payload.voltaje_A }
      ]
      this.seriesVoltaje = [{
        name: 'Voltaje A',
        data: vData.slice(-this.windowSize)
      }]
      this.$refs.chartVoltaje.updateSeries(this.seriesVoltaje)

      // ── Corriente ────────────────────────────────────────────
      this.rawCorriente.push(payload.corriente_A)
      this.rawCorriente = this.rawCorriente.slice(-this.windowSize)
      const iData = [
        ...this.seriesCorriente[0].data,
        { x: ts, y: payload.corriente_A }
      ]
      this.seriesCorriente = [{
        name: 'Corriente A',
        data: iData.slice(-this.windowSize)
      }]
      this.$refs.chartCorriente.updateSeries(this.seriesCorriente)
    })
  }
}
</script>

<style scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.chart-block {
  background: #fff;
  padding: 1rem;
  border-radius: 4px;
}
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}
.stat-item {
  flex: 1;
  text-align: center;
  padding: 0.25rem;
  background: #f0f0f0;
  margin: 0 0.25rem;
  border-radius: 4px;
}
.stat-item:first-child { margin-left: 0; }
.stat-item:last-child  { margin-right: 0; }
</style>
