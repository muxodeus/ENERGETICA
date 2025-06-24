<!-- src/components/GaussianDistributionChart.vue -->
<template>
  <div class="gaussian-chart">
    <ApexChart 
      type="line" 
      height="320" 
      :options="chartOptions" 
      :series="gaussianSeries" 
    />
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import ApexChart from 'vue3-apexcharts'

const props = defineProps({
  energyData: {
    type: Array,
    required: true
  }
});

// Calcula la curva de distribución gaussiana a partir de los datos de energía
const gaussianSeries = computed(() => {
  // Extrae los valores numéricos del array provided
  const values = props.energyData.filter(v => typeof v === 'number');
  
  if (!values.length) return [];

  const n = values.length;
  const mean = values.reduce((acc, v) => acc + v, 0) / n;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  if (std === 0) return [];

  // Genera puntos para la curva en el rango [mean - 3σ, mean + 3σ]
  const numberOfPoints = 50;
  const start = mean - 3 * std;
  const end = mean + 3 * std;
  const step = (end - start) / (numberOfPoints - 1);

  const seriesData = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const x = start + i * step;
    const density = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(- Math.pow(x - mean, 2) / (2 * std * std));
    seriesData.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(density.toFixed(4)) });
  }

  return [{
    name: 'Distribución Gaussiana',
    data: seriesData
  }];
});

// Opciones para el gráfico de distribución gaussiana
const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: true },
    zoom: { enabled: true }
  },
  stroke: { curve: 'smooth' },
  xaxis: {
    type: 'numeric',
    title: { text: 'Energía (kWh)' }
  },
  yaxis: {
    title: { text: 'Densidad de Probabilidad' }
  },
  tooltip: {
    x: {
      formatter: val => val
    }
  }
}));
</script>

<style scoped>
.gaussian-chart {
  max-width: 100%;
  margin: auto;
}
</style>
