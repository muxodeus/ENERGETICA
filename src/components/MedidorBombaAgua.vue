<!-- src/components/BombaAguaDashboard.vue -->
<template>
  <div>
    <h2>BOMBA_AGUA</h2>
    <apexchart
      width="100%"
      type="line"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script>
import mqtt from 'mqtt'

export default {
  data() {
    return {
      chartSeries: [
        { name: 'Voltaje A', data: [] },
        { name: 'Corriente A', data: [] },
      ],
      chartOptions: {
        chart: { id: 'realtime', animations: { enabled: true } },
        xaxis: { type: 'category' },
        yaxis: [{ title: { text: 'Volts' } }, { opposite: true, title: { text: 'Amps' } }],
        stroke: { curve: 'smooth' },
        title: { text: 'BOMBA_AGUA - Tiempo real', align: 'left' }
      }
    }
  },
  mounted() {
    const client = mqtt.connect('wss://d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud:8884', {
      clientId: 'frontend_dashboard_' + Math.random().toString(16).slice(2)
    })

    client.on('connect', () => {
      console.log('✅ Conectado a MQTT')
      client.subscribe('energia/BOMBA_AGUA')
    })

    client.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString())
      const ts = new Date(payload.timestamp * 1000).toLocaleTimeString()
      this.chartSeries[0].data.push({ x: ts, y: payload.voltaje_A })
      this.chartSeries[1].data.push({ x: ts, y: payload.corriente_A })

      if (this.chartSeries[0].data.length > 20) {
        this.chartSeries[0].data.shift()
        this.chartSeries[1].data.shift()
      }
    })
  }
}
</script>
