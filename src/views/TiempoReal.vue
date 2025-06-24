<template>
  <div class="tiempo-real">
    <header class="tiempo-real-header">
      <h1>Vista en Tiempo Real</h1>
      <p>Monitorea datos en vivo de tus medidores</p>
    </header>
    <!-- Se llama al componente EnergiaChart que contiene los gráficos -->
    <EnergiaChart />
  </div>
</template>

<script setup>
import EnergiaChart from '@/components/EnergiaChart.vue'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.tiempo-real {
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  background: #f7f9fc;
  min-height: calc(100vh - 40px);
  text-align: center;
}
.tiempo-real-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.tiempo-real-header p {
  font-size: 1.2rem;
  color: #555;
}
</style>
