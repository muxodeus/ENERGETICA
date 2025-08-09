<template>
  <div class="dashboard-tiempo-real">
    <!--
    <header class="header">… KPIs eliminado …</header>
    <section class="charts-section">… gráficos principales eliminados …</section>
    -->

    <!-- Solo dejamos la sección de gráficos personalizables -->
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
import { ref, onMounted, onUnmounted } from 'vue';
import mqtt from 'mqtt';
import ApexChart from 'vue3-apexcharts';
import Picklist from '@/components/Picklist.vue';

// Parámetros disponibles y mapeo de clave en payload
const availableParameters = [
  { value:'voltaje_A',      label:'Voltaje A',       key:'voltaje_A' },
  { value:'corriente_A',    label:'Corriente A',     key:'corriente_A' },
  { value:'potencia_total', label:'Potencia Total',  key:'potencia_total' },
  { value:'energia_total',  label:'Energía Total',   key:'energia_total' },

];

// Estados para picklists
const selectedParam1 = ref('voltaje_A')          // default Voltaje A
const selectedParam2 = ref('corriente_A')        // default Corriente A
const selectedParam3 = ref('potencia_total')     // default Potencia Total
const selectedParam4 = ref('energia_total')      // default Energia total


// Helpers para generar series y opciones
function makeCustom(label) {
  return {
    series: ref([{ name: label, data: [] }]),
    options: ref({
      chart: {
        id: label,
        animations: { enabled: true, dynamicAnimation: { speed: 1000 }, easing: 'linear' }
      },
      xaxis: { type: 'datetime' },
      title: { text: label }
    })
  };
}

const { series: customChart1Series, options: customChart1Options } = makeCustom('Gráfico 1');
const { series: customChart2Series, options: customChart2Options } = makeCustom('Gráfico 2');
const { series: customChart3Series, options: customChart3Options } = makeCustom('Gráfico 3');
const { series: customChart4Series, options: customChart4Options } = makeCustom('Gráfico 4');

// Reset de datos y títulos
function resetCustomSeries() {
  const p1 = availableParameters.find(p => p.value === selectedParam1.value);
  const p2 = availableParameters.find(p => p.value === selectedParam2.value);
  const p3 = availableParameters.find(p => p.value === selectedParam3.value);
  const p4 = availableParameters.find(p => p.value === selectedParam4.value);

  customChart1Series.value = [{ name: p1.label, data: [] }];
  customChart2Series.value = [{ name: p2.label, data: [] }];
  customChart3Series.value = [{ name: p3.label, data: [] }];
  customChart4Series.value = [{ name: p4.label, data: [] }];

  customChart1Options.value.title.text = p1.label;
  customChart2Options.value.title.text = p2.label;
  customChart3Options.value.title.text = p3.label;
  customChart4Options.value.title.text = p4.label;
}

// Conexión MQTT y manejo de mensajes
let client = null;

onMounted(() => {
  client = mqtt.connect(import.meta.env.VITE_MQTT_HOST, {
    username: import.meta.env.VITE_MQTT_USER,
    password: import.meta.env.VITE_MQTT_PASS,
    clientId: `customdash_${Math.random().toString(16).slice(2)}`,
    clean: true,
    keepalive: 60,
    reconnectPeriod: 2000
  });

  client.on('connect', () => {
    console.log('✅ MQTT conectado – Custom Charts');
    client.subscribe('energia/BOMBA_AGUA', err => {
      if (err) console.error('❌ Suscripción fallida', err);
    });
  });

  client.on('message', (_, msg) => {
    const payload = JSON.parse(msg.toString());
    const now = Date.now();

    // Actualizar cada gráfica personalizada
    [
      { sel: selectedParam1.value, series: customChart1Series },
      { sel: selectedParam2.value, series: customChart2Series },
      { sel: selectedParam3.value, series: customChart3Series },
      { sel: selectedParam4.value, series: customChart4Series }
    ].forEach(({ sel, series }) => {
      const key = availableParameters.find(p => p.value === sel)?.key;
      const val = payload[key];
      if (val != null) {
        series.value[0].data.push({ x: now, y: val });
        if (series.value[0].data.length > 20)
          series.value[0].data.shift();
      }
    });
  });
});

onUnmounted(() => {
  if (client) {
    client.end();
    client = null;
  }
});
</script>

<style scoped>
.dashboard-tiempo-real {
  padding: 1.5rem;
}
.custom-charts-section {
  margin-top: 1rem;
}
.custom-charts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.custom-controls {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}
.custom-charts-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.chart-item.custom-chart {
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
