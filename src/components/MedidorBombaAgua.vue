<!-- src/components/MedidorBombaAgua.vue -->
<template>
  <div>
    <h2>Medidor Bomba de Agua</h2>

    <div class="chart-container">
      <!-- Bloque Voltaje -->
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
          <div class="stat-item">
            <strong>Min:</strong> {{ statsVoltaje.min }}
          </div>
          <div class="stat-item">
            <strong>Max:</strong> {{ statsVoltaje.max }}
          </div>
          <div class="stat-item">
            <strong>Prom:</strong> {{ statsVoltaje.avg }}
          </div>
          <div class="stat-item">
            <strong>p5:</strong> {{ statsVoltaje.p5 }}
          </div>
          <div class="stat-item">
            <strong>p95:</strong> {{ statsVoltaje.p95 }}
          </div>
        </div>
      </div>

      <!-- Bloque Corriente -->
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
          <div class="stat-item">
            <strong>Min:</strong> {{ statsCorriente.min }}
          </div>
          <div class="stat-item">
            <strong>Max:</strong> {{ statsCorriente.max }}
          </div>
          <div class="stat-item">
            <strong>Prom:</strong> {{ statsCorriente.avg }}
          </div>
          <div class="stat-item">
            <strong>p5:</strong> {{ statsCorriente.p5 }}
          </div>
          <div class="stat-item">
            <strong>p95:</strong> {{ statsCorriente.p95 }}
          </div>
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
    return {
      seriesVoltaje: [{ name: 'Voltaje A', data: [] }],
      seriesCorriente: [{ name: 'Corriente A', data: [] }],
      optionsVoltaje: {
        chart: { id: 'voltaje', animations: { enabled: true } },
        xaxis: { type: 'category' }, yaxis: { title: { text: 'V' } },
        stroke: { curve: 'smooth' }
      },
      optionsCorriente: {
        chart: { id: 'corriente', animations: { enabled: true } },
        xaxis: { type: 'category' }, yaxis: { title: { text: 'A' } },
        stroke: { curve: 'smooth' }
      },
      rawVoltaje: [],
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
      if (!arr.length) return { min: 0, max: 0, avg: 0, p5: 0, p95: 0 }
      const sorted = [...arr].sort((a,b)=>a-b)
      const n = sorted.length
      const sum = sorted.reduce((s,v)=>s+v, 0)
      const avg = sum/n
      const p = idx => sorted[Math.min(n-1, Math.floor(idx*n))]
      const f = v => v.toFixed(dec)
      return {
        min: f(sorted[0]),
        max: f(sorted[n-1]),
        avg: f(avg),
        p5: f(p(0.05)),
        p95: f(p(0.95))
      }
    }
  },
  mounted() {
    const client = mqtt.connect(BROKER_URL, {
      clientId: 'bomba_' + Math.random().toString(16).slice(2),
      username: MQTT_USER, password: MQTT_PASS,
      reconnectPeriod: 3000, connectTimeout: 4000
    })
    client.on('connect', () => client.subscribe('energia/BOMBA_AGUA'))
    client.on('message', (_, msg) => {
      const { voltaje_A, corriente_A, timestamp } = JSON.parse(msg.toString())
      const ts = new Date(timestamp*1000).toLocaleTimeString()

      // Voltaje
      this.rawVoltaje.push(voltaje_A)
      this.rawVoltaje = this.rawVoltaje.slice(-20)
      const vData = [
        ...this.seriesVoltaje[0].data,
        { x: ts, y: voltaje_A }
      ].slice(-20)
      this.seriesVoltaje = [{ name:'Voltaje A', data: vData }]
      this.$refs.chartVoltaje.updateSeries(this.seriesVoltaje)

      // Corriente
      this.rawCorriente.push(corriente_A)
      this.rawCorriente = this.rawCorriente.slice(-20)
      const iData = [
        ...this.seriesCorriente[0].data,
        { x: ts, y: corriente_A }
      ].slice(-20)
      this.seriesCorriente = [{ name:'Corriente A', data: iData }]
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
