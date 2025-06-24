<template>
  <div class="trends-dashboard">
    <!-- Encabezado reusable -->
    <DashboardHeader 
      title="Tendencias en Estado Estable" 
      subtitle="Visualización personalizada de variables" 
    />

    <!-- Panel de Configuración -->
    <div class="config-panel">
      <div class="date-filters">
        <label>Desde:
          <input type="date" v-model="desde" />
        </label>
        <label>Hasta:
          <input type="date" v-model="hasta" />
        </label>
      </div>
      <div class="variable-and-layout">
        <button class="btn-config" @click="mostrarModal = true">
          Configurar Variables
        </button>
        <div class="layout-mode">
          <span>Modo:</span>
          <label>
            <input type="radio" value="combinado" v-model="layoutMode" /> Combinado
          </label>
          <label>
            <input type="radio" value="separado" v-model="layoutMode" /> Separado
          </label>
        </div>
      </div>
      <div class="config-buttons">
        <button @click="filtrarDatos">Filtrar Datos</button>
        <button @click="exportarCSV">Exportar CSV</button>
        <button @click="guardarConfig">Guardar Configuración</button>
        <button @click="limpiarConfig">Limpiar Configuración</button>
      </div>
    </div>

    <!-- Vista combinada: gráfico único con estadísticas debajo -->
    <div v-if="layoutMode === 'combinado' && combinedSeries.length > 0" class="combined-chart">
      <div class="chart-container">
        <ApexChart 
          ref="combinedChartRef"
          :key="combinedKey" 
          type="line" 
          height="400" 
          :options="combinedOptions" 
          :series="combinedSeries" 
        />
        <button class="copy-button" @click="copyChartImage">
          Copiar imagenes
        </button>
      </div>
      <div class="stats-box">
        <table>
          <thead>
            <tr>
              <th>Parámetro</th>
              <th>Mínimo</th>
              <th>Percentil 5</th>
              <th>Promedio</th>
              <th>Percentil 95</th>
              <th>Máximo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="serie in combinedSeries" :key="serie.name">
              <td>{{ serie.name }}</td>
              <td>{{ getStats(serie).min }}</td>
              <td>{{ getStats(serie).p5 }}</td>
              <td>{{ getStats(serie).average }}</td>
              <td>{{ getStats(serie).p95 }}</td>
              <td>{{ getStats(serie).max }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Vista separada: cada fila muestra el gráfico de tendencia (75%) y, a la derecha, el gráfico estadístico (25%) -->
    <div v-else-if="layoutMode === 'separado' && separatedSeries.length > 0" class="separated-charts">
      <div v-for="(serieGroup, index) in separatedSeries" :key="index" class="trend-gaussian-container">
        <!-- Columna izquierda (75%): gráfico de tendencia y tabla de estadísticas debajo -->
        <div class="trend-chart">
          <h3>{{ serieGroup[0].name }}</h3>
          <ApexChart 
            :ref="el => setSeparatedChartRef(serieGroup[0].name, el)"
            :key="separatedKey(serieGroup[0])" 
            type="line" 
            height="320" 
            :options="separatedOptions" 
            :series="serieGroup" 
          />
          <button class="copy-button" @click="copyChartImageForSerie(serieGroup[0])">
            Copiar imagenes
          </button>
          <div class="stats-box">
            <table>
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Mínimo</th>
                  <th>Percentil 5</th>
                  <th>Promedio</th>
                  <th>Percentil 95</th>
                  <th>Máximo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ serieGroup[0].name }}</td>
                  <td>{{ getStats(serieGroup[0]).min }}</td>
                  <td>{{ getStats(serieGroup[0]).p5 }}</td>
                  <td>{{ getStats(serieGroup[0]).average }}</td>
                  <td>{{ getStats(serieGroup[0]).p95 }}</td>
                  <td>{{ getStats(serieGroup[0]).max }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Columna derecha (25%): gráfico estadístico que se actualiza con zoom -->
        <div class="statistical-chart">
          <StatisticalDistributionChart :data="filterData(serieGroup[0].data)" />
        </div>
      </div>
    </div>
    
    <!-- Sin datos -->
    <div v-else class="no-data">
      <p>No hay datos para mostrar.</p>
    </div>

    <!-- Modal para selección de variables -->
    <VariablesToggle 
      v-if="mostrarModal" 
      :visible="mostrarModal" 
      :initialSelected="selectedVariables"
      @update:selected="actualizarVariables"
      @close="mostrarModal = false" 
    />
    
    <FooterGlobal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import ApexChart from 'vue3-apexcharts';
import DashboardHeader from '@/components/DashboardHeader.vue';
import FooterGlobal from '@/components/FooterGlobal.vue';
import VariablesToggle from '@/components/VariablesToggle.vue';
import Picklist from '../components/Picklist.vue';
import StatisticalDistributionChart from '@/components/StatisticalDistributionChart.vue';

const listaParametros = ref([
  { value: 'tension1', label: 'Voltage A' },
  { value: 'tension2', label: 'Voltage B' },
  { value: 'tension3', label: 'Voltage C' },
  { value: 'tensionN', label: 'Neutro' },
  { value: 'corriente1', label: 'Corriente Fase 1' },
  { value: 'corriente2', label: 'Corriente Fase 2' },
  { value: 'corriente3', label: 'Corriente Fase 3' },
  { value: 'potenciaTotal', label: 'Potencia Total' },
  { value: 'energia', label: 'Energía' },
  { value: 'factorPotencia', label: 'Factor de Potencia' },
  { value: 'distorsion', label: 'Distorsión Armónica' }
]);

const desde = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
const hasta = ref(dayjs().format('YYYY-MM-DD'));

const selectedVariables = ref({
  tension1: true,
  tension2: false,
  tension3: false,
  tensionN: false,
  corriente1: false,
  corriente2: false,
  corriente3: false,
  potenciaTotal: false,
  energia: false,
  factorPotencia: false,
  distorsion: false
});

const layoutMode = ref('combinado');
const mostrarModal = ref(false);
const zoomRange = ref(null);

const colorMap = {
  tension1: '#e74c3c',
  tension2: '#2980b9',
  tension3: '#27ae60',
  tensionN: '#8e44ad',
  corriente1: '#f39c12',
  corriente2: '#d35400',
  corriente3: '#16a085',
  potenciaTotal: '#2ecc71',
  energia: '#f1c40f',
  factorPotencia: '#3498db',
  distorsion: '#95a5a6'
};

const emaColorMap = {
  tension1: '#f1948a',
  tension2: '#85c1e9',
  tension3: '#58d68d'
};

const dataSim = ref([]);
const combinedChartRef = ref(null);
const separatedChartRefs = ref({});
function setSeparatedChartRef(name, el) {
  if (el) {
    separatedChartRefs.value[name] = el;
  }
}

const combinedOptions = ref({
  chart: {
    id: 'combined-chart',
    zoom: { enabled: true },
    toolbar: { show: true },
    events: {
      zoomed: (chartContext, { xaxis }) => { 
        zoomRange.value = { min: xaxis.min, max: xaxis.max }; 
      },
      beforeResetZoom: () => { 
        zoomRange.value = null; 
      }
    }
  },
  stroke: { curve: 'smooth' },
  xaxis: { type: 'datetime' },
  yaxis: []
});

const separatedOptions = ref({
  chart: {
    zoom: { enabled: true },
    toolbar: { show: true },
    events: {
      zoomed: (chartContext, { xaxis }) => { 
        zoomRange.value = { min: xaxis.min, max: xaxis.max }; 
      },
      beforeResetZoom: () => { 
        zoomRange.value = null; 
      }
    }
  },
  stroke: { curve: 'smooth' },
  xaxis: { type: 'datetime' }
});

const combinedSeries = ref([]);
const separatedSeries = ref([]);

const combinedKey = computed(() => 'combined-' + JSON.stringify(combinedSeries.value));
const separatedKey = (serie) => 'separated-' + serie.name + '-' + JSON.stringify(serie.data);

function computeEMA(data, period = 10) {
  if (!data.length) return [];
  const k = 2 / (period + 1);
  const result = [];
  let emaPrev = data[0].y;
  result.push({ x: data[0].x, y: Number(emaPrev.toFixed(2)) });
  for (let i = 1; i < data.length; i++) {
    const ema = data[i].y * k + emaPrev * (1 - k);
    result.push({ x: data[i].x, y: Number(ema.toFixed(2)) });
    emaPrev = ema;
  }
  return result;
}

function simularDatos() {
  dataSim.value = [];
  const start = dayjs(desde.value);
  const end = dayjs(hasta.value);
  const dias = end.diff(start, 'day') + 1;
  for (let d = 0; d < dias; d++) {
    for (let h = 0; h < 24; h++) {
      const timestamp = start.add(d, 'day').hour(h).minute(0).second(0).valueOf();
      dataSim.value.push({
        timestamp,
        tension1: +(220 + Math.random() * 10 - 5).toFixed(1),
        tension2: +(220 + Math.random() * 10 - 5).toFixed(1),
        tension3: +(220 + Math.random() * 10 - 5).toFixed(1),
        tensionN: +(110 + Math.random() * 5 - 2.5).toFixed(1),
        corriente1: +(5 + Math.random() * 2 - 1).toFixed(1),
        corriente2: +(5 + Math.random() * 2 - 1).toFixed(1),
        corriente3: +(5 + Math.random() * 2 - 1).toFixed(1),
        potenciaTotal: +(50 + Math.random() * 20 - 10).toFixed(1),
        energia: +(50 + Math.random() * 20 - 10).toFixed(1),
        factorPotencia: +(0.8 + Math.random() * 0.2).toFixed(2),
        distorsion: +(5 + Math.random() * 3).toFixed(1)
      });
    }
  }
}

function generarSeriesCombinado() {
  const seriesComb = [];
  const activeCount = Object.values(selectedVariables.value).filter(v => v).length;
  for (const key in selectedVariables.value) {
    if (selectedVariables.value[key]) {
      const paramInfo = listaParametros.value.find(p => p.value === key);
      const label = paramInfo ? paramInfo.label : key;
      const mainData = dataSim.value.map(item => ({ x: item.timestamp, y: item[key] }));
      seriesComb.push({
        name: label,
        data: mainData,
        color: colorMap[key]
      });
      if (activeCount === 1) {
        seriesComb.push({
          name: label + ' EMA',
          data: computeEMA(mainData, 10),
          color: emaColorMap[key] || '#bdc3c7',
          type: 'area',
          fill: { opacity: 0.3 }
        });
      }
    }
  }
  combinedSeries.value = seriesComb;
  const ejeIzquierdo = { title: { text: 'Magnitudes Básicas' } };
  const ejeDerecho = { opposite: true, title: { text: 'Magnitudes Eléctricas' } };
  if (
    selectedVariables.value.tension1 ||
    selectedVariables.value.tension2 ||
    selectedVariables.value.tension3 ||
    selectedVariables.value.corriente1 ||
    selectedVariables.value.corriente2 ||
    selectedVariables.value.corriente3
  ) {
    combinedOptions.value.yaxis = [ejeIzquierdo, ejeDerecho];
  } else {
    combinedOptions.value.yaxis = [ejeIzquierdo];
  }
}

function generarSeriesSeparado() {
  const sepSeries = [];
  for (const key in selectedVariables.value) {
    if (selectedVariables.value[key]) {
      const paramInfo = listaParametros.value.find(p => p.value === key);
      const label = paramInfo ? paramInfo.label : key;
      const mainData = dataSim.value.map(item => ({ x: item.timestamp, y: item[key] }));
      if (['tension1', 'tension2', 'tension3'].includes(key)) {
        sepSeries.push([
          {
            name: label,
            data: mainData,
            color: colorMap[key]
          },
          {
            name: label + ' EMA',
            data: computeEMA(mainData, 10),
            color: emaColorMap[key],
            type: 'area',
            fill: { opacity: 0.3 }
          }
        ]);
      } else {
        sepSeries.push([
          {
            name: label,
            data: mainData,
            color: colorMap[key]
          }
        ]);
      }
    }
  }
  separatedSeries.value = sepSeries;
}

function filtrarDatos() {
  simularDatos();
  generarSeriesCombinado();
  generarSeriesSeparado();
}

function exportarCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "timestamp,tension1,tension2,tension3,tensionN,corriente1,corriente2,corriente3,potenciaTotal,energia,factorPotencia,distorsion\n";
  dataSim.value.forEach(item => {
    csvContent += `${item.timestamp},${item.tension1},${item.tension2},${item.tension3},${item.tensionN},${item.corriente1},${item.corriente2},${item.corriente3},${item.potenciaTotal},${item.energia},${item.factorPotencia},${item.distorsion}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "datos_tendencias.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function guardarConfig() {
  const config = {
    desde: desde.value,
    hasta: hasta.value,
    selectedVariables: { ...selectedVariables.value },
    layoutMode: layoutMode.value
  };
  localStorage.setItem("dashboardConfig", JSON.stringify(config));
  alert("Configuración guardada");
}

function limpiarConfig() {
  localStorage.removeItem("dashboardConfig");
  selectedVariables.value = {
    tension1: true,
    tension2: false,
    tension3: false,
    tensionN: false,
    corriente1: false,
    corriente2: false,
    corriente3: false,
    potenciaTotal: false,
    energia: false,
    factorPotencia: false,
    distorsion: false
  };
  filtrarDatos();
  alert("Configuración limpiada");
}

function actualizarVariables(nuevas) {
  selectedVariables.value = nuevas;
  filtrarDatos();
  mostrarModal.value = false;
}

onMounted(() => {
  const config = localStorage.getItem("dashboardConfig");
  if (config) {
    const parsed = JSON.parse(config);
    desde.value = parsed.desde;
    hasta.value = parsed.hasta;
    selectedVariables.value = parsed.selectedVariables;
    layoutMode.value = parsed.layoutMode;
  }
  filtrarDatos();
});

function computeStats(values) {
  if (!values.length) return { min: '-', p5: '-', average: '-', p95: '-', max: '-' };
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const average = sorted.reduce((acc, v) => acc + v, 0) / sorted.length;
  const p5 = percentile(sorted, 5);
  const p95 = percentile(sorted, 95);
  return {
    min: Number(min).toFixed(2),
    p5: Number(p5).toFixed(2),
    average: Number(average).toFixed(2),
    p95: Number(p95).toFixed(2),
    max: Number(max).toFixed(2)
  };
}

function percentile(sorted, p) {
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function getStats(serie) {
  if (!serie || !serie.data) return {};
  let data = serie.data;
  if (zoomRange.value) {
    data = data.filter(d => d.x >= zoomRange.value.min && d.x <= zoomRange.value.max);
  }
  const values = data.map(d => d.y).filter(v => typeof v === 'number');
  return computeStats(values);
}

combinedOptions.value.chart.events = {
  zoomed: (chartContext, { xaxis }) => {
    zoomRange.value = { min: xaxis.min, max: xaxis.max };
  },
  beforeResetZoom: () => {
    zoomRange.value = null;
  }
};

separatedOptions.value.chart.events = {
  zoomed: (chartContext, { xaxis }) => {
    zoomRange.value = { min: xaxis.min, max: xaxis.max };
  },
  beforeResetZoom: () => {
    zoomRange.value = null;
  }
};

function filterData(data) {
  if (zoomRange.value && zoomRange.value.min && zoomRange.value.max) {
    return data.filter(d => d.x >= zoomRange.value.min && d.x <= zoomRange.value.max);
  }
  return data;
}

async function copyChartImage() {
  try {
    const chartInstance = combinedChartRef.value;
    const dataURI = await chartInstance.dataURI();
    const blob = dataURI.blob;
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    alert("Imagen copiada al portapapeles");
  } catch (e) {
    alert("Error copiando imagen: " + e);
  }
}

async function copyChartImageForSerie(serie) {
  try {
    const chartInstance = separatedChartRefs.value[serie.name];
    if (chartInstance && chartInstance.dataURI) {
      const dataURI = await chartInstance.dataURI();
      const blob = dataURI.blob;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      alert("Imagen copiada al portapapeles");
    } else {
      alert("No se encontró el gráfico para copiar.");
    }
  } catch (e) {
    alert("Error copiando imagen: " + e);
  }
}
</script>

<style scoped>
.trends-dashboard {
  display: flex;
  flex-direction: column;
  background-color: #f7f9fc;
  min-height: 100vh;
  padding-bottom: 3rem;
}
.config-panel {
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
}
.config-panel .date-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.config-panel label {
  font-weight: bold;
  margin-right: 0.5rem;
}
.variable-and-layout {
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}
.btn-config {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.btn-config:hover {
  background-color: #2980b9;
}
.layout-mode {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.config-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}
.config-panel button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.config-panel button:hover {
  background-color: #2980b9;
}
.chart-container {
  position: relative;
  margin: 1rem;
}
.copy-button {
  margin-top: 0.5rem;
}
.trend-gaussian-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin: 1rem;
}
.trend-chart {
  flex-basis: 75%;
}
.statistical-chart {
  flex-basis: 25%;
}
.stats-box {
  margin: 1rem;
  overflow-x: auto;
}
.vertical-stats-box {
  margin: 1rem;
  overflow-x: auto;
}
.vertical-stats-box table {
  border-collapse: collapse;
}
.vertical-stats-box th,
.vertical-stats-box td {
  border: 1px solid #ddd;
  padding: 0.4rem;
  text-align: left;
}
.stats-box table {
  width: 100%;
  border-collapse: collapse;
}
.stats-box th,
.stats-box td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: center;
}
.no-data {
  text-align: center;
  padding: 1rem;
  color: #888;
}
</style>
