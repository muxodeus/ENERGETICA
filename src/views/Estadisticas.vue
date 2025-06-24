<template>
  <div class="estadisticas-dashboard">
    <header class="barra-controles">
      <h2>Estadísticas energéticas</h2>
      <div class="controles">
        <Picklist
          v-model="parametro"
          label="Parámetro"
          :options="parametrosDisponibles"
        />
        <div class="rango-fechas">
          <label>Desde</label>
          <input type="date" v-model="desde" />
          <label>Hasta</label>
          <input type="date" v-model="hasta" />
        </div>
        <button @click="analizar">Analizar</button>
        <button @click="exportarCSV">Exportar CSV</button>
        <button @click="exportarPDF">Exportar PDF</button>
        <button @click="generarRecomendaciones">Ver recomendaciones</button>
      </div>
    </header>

    <section class="kpi-grid">
      <div class="kpi" v-for="(valor, key) in estadisticas" :key="key">
        <div class="valor">{{ valor.label }}</div>
        <div class="descripcion">{{ valor.desc }}</div>
      </div>
    </section>

    <section class="graficos">
      <ApexChart type="bar" height="300" :options="graficoHistograma.options" :series="graficoHistograma.series" />
      <ApexChart type="area" height="300" :options="graficoGauss.options" :series="graficoGauss.series" />
      <ApexChart type="bar" height="300" :options="graficoApilado.options" :series="graficoApilado.series" />
      <ApexChart type="radialBar" height="300" :options="graficoRadial.options" :series="graficoRadial.series" />
      <ApexChart type="bullet" height="100" :options="graficoBullet.options" :series="graficoBullet.series" />
      <ApexChart type="line" height="300" :options="graficoCarga.options" :series="graficoCarga.series" />
    </section>
  </div>
</template>

<script setup>
import html2pdf from 'html2pdf.js'
import { ref } from 'vue'
import dayjs from 'dayjs'
import Picklist from '../components/Picklist.vue'

const parametro = ref('energia')
const desde = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const hasta = ref(dayjs().format('YYYY-MM-DD'))

const parametrosDisponibles = [
  { value: 'energia', label: 'Energía activa (kWh)', unidad: 'kWh' },
  { value: 'voltajeA', label: 'Voltaje A (V)', unidad: 'V' },
  { value: 'corrienteB', label: 'Corriente B (A)', unidad: 'A' },
  { value: 'potenciaTotal', label: 'Potencia activa total (kW)', unidad: 'kW' }
]

const unidad = ref('kWh')
const estadisticas = ref({})

const graficoHistograma = ref({ options: {}, series: [] })
const graficoGauss = ref({ options: {}, series: [] })
const graficoApilado = ref({ options: {}, series: [] })
const graficoRadial = ref({ options: {}, series: [] })
const graficoBullet = ref({ options: {}, series: [] })
const graficoCarga = ref({ options: {}, series: [] })

function exportarCSV() {
  const filas = [['Métrica', 'Valor']]
  for (const key in estadisticas.value) {
    filas.push([estadisticas.value[key].desc, estadisticas.value[key].label])
  }
  const csv = filas.map(f => f.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `estadisticas_${parametro.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function exportarPDF() {
  const dashboard = document.querySelector('.estadisticas-dashboard')
  html2pdf().set({
    margin: 0.5,
    filename: `estadisticas_${parametro.value}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }).from(dashboard).save()
}

function generarRecomendaciones() {
  const p95 = parseFloat(estadisticas.value.p95?.label || 0)
  const prom = parseFloat(estadisticas.value.prom?.label || 0)
  const factor = parseFloat(estadisticas.value.factorCarga?.label?.replace('%', '') || 0)

  if (p95 > prom * 1.5) {
    alert('⚠️ Advertencia: el parámetro muestra picos estadísticos elevados. Verifica anomalías o sobrecargas.')
  } else if (factor < 40) {
    alert('💡 Bajo factor de carga: podrías optimizar la distribución del consumo.')
  } else {
    alert('✅ El comportamiento estadístico del parámetro es estable.')
  }
}

function analizar() {
  const param = parametrosDisponibles.find(p => p.value === parametro.value)
  unidad.value = param.unidad

  const muestras = Array.from({ length: 100 }, () =>
    +(Math.random() * 40 + 10).toFixed(1)
  ).sort((a, b) => a - b)

  const suma = muestras.reduce((a, b) => a + b, 0)
  const prom = +(suma / muestras.length).toFixed(1)
  const min = muestras[0]
  const max = muestras[muestras.length - 1]
  const p5 = muestras[Math.floor(0.05 * muestras.length)]
  const p95 = muestras[Math.floor(0.95 * muestras.length)]

  estadisticas.value = {
    min: { label: `${min}`, desc: 'Mínimo observado' },
    max: { label: `${max}`, desc: 'Máximo observado' },
    prom: { label: `${prom}`, desc: 'Promedio del periodo' },
    p95: { label: `${p95}`, desc: 'Percentil 95' },
    p5: { label: `${p5}`, desc: 'Percentil 5' },
    total: { label: `${+(suma).toFixed(1)}`, desc: 'Total del periodo' },
    pico: {
      label: `${max}`,
      desc: `Pico simulado a las ${Math.floor(Math.random() * 24)}:00`
    },
    cargaBase: { label: `${p5}`, desc: 'Carga base estimada' },
    factorCarga: { label: `${+(prom / max * 100).toFixed(0)}%`, desc: 'Factor carga estimado' }
  }

  graficoHistograma.value = {
    options: {
      chart: { id: 'histograma' },
      xaxis: { categories: muestras.slice(0, 20).map((_, i) => `Val ${i}`) },
      title: { text: 'Distribución de frecuencias' }
    },
    series: [{ name: 'Frecuencia', data: muestras.slice(0, 20) }]
  }

  graficoGauss.value = {
    options: {
      chart: { id: 'gauss' },
      title: { text: 'Distribución tipo Gauss simulada' },
      xaxis: { type: 'numeric' }
    },
    series: [{
      name: 'Probabilidad',
      data: muestras.map((x, i) => [i, x])
    }]
  }

  graficoApilado.value = {
    options: {
      chart: { stacked: true },
      title: { text: 'Consumo por dispositivo simulado' },
      xaxis: { categories: ['Zona A', 'Zona B', 'Zona C'] }
    },
    series: [
      { name: 'Medidor 1', data: [20, 35, 40] },
      { name: 'Medidor 2', data: [25, 30, 28] }
    ]
  }

  graficoRadial.value = {
    options: {
      labels: ['Eficiencia'],
      title: { text: 'Cumplimiento' }
    },
    series: [+(prom / 60 * 100).toFixed(0)]
  }

  graficoBullet.value = {
    options: {
      chart: { type: 'bar' },
      title: { text: 'Valor vs Meta (Bullet)' },
      xaxis: { categories: ['Objetivo'] }
    },
    series: [{ name: 'Actual', data: [prom] }]
  }

  graficoCarga.value = {
    options: {
      chart: { type: 'line' },
      xaxis: { categories: Array.from({ length: 24 }, (_, i) => `${i}h`) },
      title: { text: 'Distribución horaria simulada' }
    },
    series: [
      {
        name: param.label,
        data: Array.from({ length: 24 }, () =>
          +(Math.random() * 20 + 10).toFixed(1)
        )
      }
    ]
  }
}

analizar()
</script>

<style scoped>
.estadisticas-dashboard {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.barra-controles {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.controles {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.rango-fechas {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.kpi {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.8rem;
  text-align: center;
}

.valor {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2a2a2a;
}

.descripcion {
  font-size: 0.8rem;
  color: #666;
}

.graficos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}
</style>
