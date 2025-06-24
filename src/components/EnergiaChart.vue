<template>
  <div class="dashboard-tiempo-real">
    <header class="header">
      <h2>Dashboard de Tiempo Real – Nivel God</h2>
      <div class="kpi-container">
        <div class="kpi-card" v-for="(kpi, index) in kpis" :key="index">
          <h3>{{ kpi.label }}</h3>
          <p class="value">{{ kpi.value }}</p>
        </div>
      </div>
    </header>

    <!-- Gráficos de Tiempo Real -->
    <section class="charts-section">
      <div class="chart-item">
        <h3>Consumo Energético en Tiempo Real</h3>
        <ApexChart type="line" height="300" :options="realTimeChartOptions" :series="realTimeChartSeries" />
      </div>
      <div class="chart-item">
        <h3>Potencia Activa en Tiempo Real</h3>
        <ApexChart type="line" height="300" :options="powerChartOptions" :series="powerChartSeries" />
      </div>
    </section>

    <!-- Sección de Gráficos Personalizables en Tiempo Real -->
    <section class="custom-charts-section">
      <header class="custom-charts-header">
        <h3>Visualización Personalizada de Parámetros en Tiempo Real</h3>
        <div class="custom-controls">
          <!-- Se muestran 4 picklists: dos para gráficos individuales y dos para parámetros conjuntos -->
          <Picklist
            v-model="selectedParam1"
            :options="availableParameters"
            label="Parámetro Gráfico 1"
          />
          <Picklist
            v-model="selectedParam2"
            :options="availableParameters"
            label="Parámetro Gráfico 2"
          />
          <Picklist
            v-model="selectedParam3"
            :options="availableParameters"
            label="Parámetro Gráfico 3 (Conjunto)"
          />
          <Picklist
            v-model="selectedParam4"
            :options="availableParameters"
            label="Parámetro Gráfico 4 (Conjunto)"
          />
          <button @click="updateCustomCharts">Actualizar Gráficos</button>
        </div>
      </header>
      <!-- Primera fila: dos gráficos personalizados -->
      <div class="custom-charts-container">
        <div class="chart-item custom-chart">
          <ApexChart
            :key="'custom-chart-1-' + selectedParam1.value"
            type="line"
            height="300"
            :options="customChart1Options"
            :series="customChart1Series"
          />
        </div>
        <div class="chart-item custom-chart">
          <ApexChart
            :key="'custom-chart-2-' + selectedParam2.value"
            type="line"
            height="300"
            :options="customChart2Options"
            :series="customChart2Series"
          />
        </div>
      </div>
      <!-- Segunda fila: dos gráficos personalizados para parámetros en conjunto -->
      <div class="custom-charts-container">
        <div class="chart-item custom-chart">
          <ApexChart
            :key="'custom-chart-3-' + selectedParam3.value"
            type="line"
            height="300"
            :options="customChart3Options"
            :series="customChart3Series"
          />
        </div>
        <div class="chart-item custom-chart">
          <ApexChart
            :key="'custom-chart-4-' + selectedParam4.value"
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
import { ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import ApexChart from 'vue3-apexcharts'
import Picklist from '../components/Picklist.vue'

/* ---------------------
   Gráficos de Tiempo Real
---------------------- */
/* KPIs simulados en tiempo real */
const kpis = ref([
  { label: 'Energía Total (kWh)', value: 0 },
  { label: 'Potencia Instantánea (kW)', value: 0 },
  { label: 'Frecuencia (Hz)', value: 0 }
]);

/* Gráfico de Consumo en Tiempo Real */
const realTimeChartSeries = ref([{ name: 'Consumo', data: [] }]);
const realTimeChartOptions = ref({
  chart: { 
    id: 'realtime-consumo', 
    animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } }
  },
  xaxis: { type: 'datetime' },
  yaxis: { title: { text: 'kWh' } },
  title: { text: 'Consumo Energético' }
});

/* Gráfico de Potencia en Tiempo Real */
const powerChartSeries = ref([{ name: 'Potencia', data: [] }]);
const powerChartOptions = ref({
  chart: { 
    id: 'realtime-potencia', 
    animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } }
  },
  xaxis: { type: 'datetime' },
  yaxis: { title: { text: 'kW' } },
  title: { text: 'Potencia Activa' }
});

/* Actualización de datos en tiempo real para gráficos principales */
let intervalId = null;
function updateRealTimeData() {
  const now = new Date().getTime();
  const newConsumo = +(Math.random() * 10 + 40).toFixed(2); // entre 40 y 50
  const newPower = +(Math.random() * 5 + 20).toFixed(2);      // entre 20 y 25
  const newFrequency = +(Math.random() * 0.2 + 49.8).toFixed(2); // entre 49.8 y 50 Hz

  realTimeChartSeries.value[0].data.push({ x: now, y: newConsumo });
  powerChartSeries.value[0].data.push({ x: now, y: newPower });
  if(realTimeChartSeries.value[0].data.length > 20) realTimeChartSeries.value[0].data.shift();
  if(powerChartSeries.value[0].data.length > 20) powerChartSeries.value[0].data.shift();

  kpis.value[0].value = newConsumo;
  kpis.value[1].value = newPower;
  kpis.value[2].value = newFrequency;
}

onMounted(() => {
  updateRealTimeData();
  intervalId = setInterval(updateRealTimeData, 2000);
});
onUnmounted(() => {
  clearInterval(intervalId);
});

/* ---------------------
   Gráficos Personalizables en Tiempo Real
---------------------- */
// Definir parámetros disponibles incluyendo combinados
const availableParameters = [
  { value: 'energia', label: 'Energía (kWh)' },
  { value: 'potencia', label: 'Potencia (kW)' },
  { value: 'voltaje', label: 'Voltaje (V)' },
  { value: 'corriente', label: 'Corriente (A)' },
  { value: 'voltaje_conjunto', label: 'Conjunto Voltaje' },
  { value: 'corriente_conjunto', label: 'Conjunto Corriente' },
  { value: 'potencia_conjunto', label: 'Conjunto Potencia' }
];

// Estados para los 4 picklists
const selectedParam1 = ref('energia');
const selectedParam2 = ref('potencia');
const selectedParam3 = ref('voltaje_conjunto');
const selectedParam4 = ref('corriente_conjunto');

// Gráfico personalizado 1
const customChart1Series = ref([{ name: '', data: [] }]);
const customChart1Options = ref({
  chart: { id: 'custom-chart-1', height: 300 },
  xaxis: { type: 'datetime' },
  title: { text: 'Gráfico de Energía (kWh)' }
});

// Gráfico personalizado 2
const customChart2Series = ref([{ name: '', data: [] }]);
const customChart2Options = ref({
  chart: { id: 'custom-chart-2', height: 300 },
  xaxis: { type: 'datetime' },
  title: { text: 'Gráfico de Potencia (kW)' }
});

// Gráfico personalizado 3 (para parámetros combinados)
const customChart3Series = ref([{ name: '', data: [] }]);
const customChart3Options = ref({
  chart: { id: 'custom-chart-3', height: 300 },
  xaxis: { type: 'datetime' },
  title: { text: 'Gráfico de Conjunto Voltaje' }
});

// Gráfico personalizado 4 (para parámetros combinados)
const customChart4Series = ref([{ name: '', data: [] }]);
const customChart4Options = ref({
  chart: { id: 'custom-chart-4', height: 300 },
  xaxis: { type: 'datetime' },
  title: { text: 'Gráfico de Conjunto Corriente' }
});

// Función para reinicializar y actualizar los gráficos personalizados
function updateCustomCharts() {
  const param1 = availableParameters.find(p => p.value === selectedParam1.value);
  const param2 = availableParameters.find(p => p.value === selectedParam2.value);
  const param3 = availableParameters.find(p => p.value === selectedParam3.value);
  const param4 = availableParameters.find(p => p.value === selectedParam4.value);
  
  customChart1Series.value = [{ name: param1.label, data: [] }];
  customChart2Series.value = [{ name: param2.label, data: [] }];
  customChart3Series.value = [{ name: param3.label, data: [] }];
  customChart4Series.value = [{ name: param4.label, data: [] }];

  customChart1Options.value = {
    chart: { id: 'custom-chart-1', height: 300 },
    xaxis: { type: 'datetime' },
    title: { text: `Gráfico de ${param1.label}` }
  };
  customChart2Options.value = {
    chart: { id: 'custom-chart-2', height: 300 },
    xaxis: { type: 'datetime' },
    title: { text: `Gráfico de ${param2.label}` }
  };
  customChart3Options.value = {
    chart: { id: 'custom-chart-3', height: 300 },
    xaxis: { type: 'datetime' },
    title: { text: `Gráfico de ${param3.label}` }
  };
  customChart4Options.value = {
    chart: { id: 'custom-chart-4', height: 300 },
    xaxis: { type: 'datetime' },
    title: { text: `Gráfico de ${param4.label}` }
  };
}

// Función que actualiza en tiempo real los gráficos personalizados
function updateCustomRealTimeData() {
  const now = new Date().getTime();

  // Función auxiliar para obtener base a partir del parámetro
  function getBase(paramValue) {
    switch(paramValue) {
      case 'energia': return 100;
      case 'potencia': return 50;
      case 'voltaje': return 220;
      case 'corriente': return 30;
      // Bases para conjuntos: se asignan valores representativos (pueden ajustarse)
      case 'voltaje_conjunto': return 210;
      case 'corriente_conjunto': return 28;
      case 'potencia_conjunto': return 55;
      default: return 0;
    }
  }

  // Actualizar gráfico 1
  const base1 = getBase(selectedParam1.value);
  const newVal1 = +(base1 + (Math.random() * base1 * 0.2 - base1 * 0.1)).toFixed(1);
  customChart1Series.value[0].data.push({ x: now, y: newVal1 });
  if(customChart1Series.value[0].data.length > 20)
    customChart1Series.value[0].data.shift();

  // Actualizar gráfico 2
  const base2 = getBase(selectedParam2.value);
  const newVal2 = +(base2 + (Math.random() * base2 * 0.2 - base2 * 0.1)).toFixed(1);
  customChart2Series.value[0].data.push({ x: now, y: newVal2 });
  if(customChart2Series.value[0].data.length > 20)
    customChart2Series.value[0].data.shift();

  // Actualizar gráfico 3
  const base3 = getBase(selectedParam3.value);
  const newVal3 = +(base3 + (Math.random() * base3 * 0.2 - base3 * 0.1)).toFixed(1);
  customChart3Series.value[0].data.push({ x: now, y: newVal3 });
  if(customChart3Series.value[0].data.length > 20)
    customChart3Series.value[0].data.shift();

  // Actualizar gráfico 4
  const base4 = getBase(selectedParam4.value);
  const newVal4 = +(base4 + (Math.random() * base4 * 0.2 - base4 * 0.1)).toFixed(1);
  customChart4Series.value[0].data.push({ x: now, y: newVal4 });
  if(customChart4Series.value[0].data.length > 20)
    customChart4Series.value[0].data.shift();
}

let customIntervalId = null;
onMounted(() => {
  customIntervalId = setInterval(updateCustomRealTimeData, 2000);
});
onUnmounted(() => {
  clearInterval(customIntervalId);
});

// Inicializar los gráficos personalizados al montar el componente
updateCustomCharts();
</script>

<style scoped>
.dashboard-tiempo-real {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.kpi-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.kpi-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  flex: 1;
  min-width: 180px;
}
.kpi-card .value {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 0.5rem;
}
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}
.chart-item {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
}
.custom-charts-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.custom-charts-header {
  margin-bottom: 0.5rem;
}
.custom-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
.custom-charts-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.custom-chart {
  flex: 1;
}
</style>
