<!-- src/components/StatisticalDistributionChart.vue -->
<template>
  <div class="statistical-chart">
    <template v-if="props.data.length > 0">
      <ApexChart 
        type="line" 
        height="320" 
        :options="chartOptions" 
        :series="series" 
      />
    </template>
    <template v-else>
      <p>No hay datos para mostrar</p>
    </template>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import ApexChart from 'vue3-apexcharts'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

// Convertir cada elemento a número.
// Si el elemento es un objeto y tiene la propiedad "y", se utiliza Number(v.y),
// de lo contrario, se intenta Number(v) directamente.
const sortedData = computed(() =>
  props.data
    .map(v => (typeof v === 'object' && v !== null && 'y' in v ? Number(v.y) : Number(v)))
    .filter(num => !isNaN(num))
    .sort((a, b) => a - b)
);

const minValue = computed(() => sortedData.value[0] ?? 0);
const maxValue = computed(() => {
  const last = sortedData.value[sortedData.value.length - 1];
  return last !== undefined ? last : 1;
});
const numBins = 10;
const binWidth = computed(() => {
  const width = (maxValue.value - minValue.value) / numBins;
  return width === 0 ? 1 : width;
});

// Calcular el histograma
const histogramData = computed(() => {
  const bins = new Array(numBins).fill(0);
  sortedData.value.forEach(val => {
    let index = Math.floor((val - minValue.value) / binWidth.value);
    if (index === numBins) index = numBins - 1;
    bins[index]++;
  });
  return bins.map((count, i) => {
    const binStart = minValue.value + i * binWidth.value;
    const binCenter = binStart + binWidth.value / 2;
    return { x: Number(binCenter.toFixed(2)), y: count };
  });
});

// Calcular la función de distribución acumulada (CDF)
const cdfData = computed(() => {
  const hist = histogramData.value;
  let cumulative = 0;
  const cdf = hist.map(item => {
    cumulative += item.y;
    return { x: item.x, y: cumulative };
  });
  const total = cumulative;
  return cdf.map(item => ({ x: item.x, y: Number((item.y / total * 100).toFixed(2)) }));
});

// Combinar ambas series: histograma y CDF
const series = computed(() => [
  {
    name: 'Histograma',
    type: 'column',
    data: histogramData.value,
    color: '#2980b9'
  },
  {
    name: 'CDF',
    type: 'line',
    data: cdfData.value,
    color: '#e74c3c'
  }
]);

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: true },
    zoom: { enabled: false }
  },
  stroke: { curve: 'smooth' },
  dataLabels: { enabled: false },
  xaxis: {
    type: 'numeric',
    title: { text: 'Valor' }
  },
  yaxis: [
    {
      title: { text: 'Frecuencia' },
      min: 0
    },
    {
      opposite: true,
      title: { text: 'Cumulative (%)' },
      max: 100
    }
  ],
  tooltip: { shared: true },
  plotOptions: {
    bar: { columnWidth: '50%' }
  },
  legend: { show: true }
}));
</script>

<style scoped>
.statistical-chart {
  max-width: 100%;
  margin: auto;
}
</style>
