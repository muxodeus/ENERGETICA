<template>
  <div class="reportes">
    <h2>Generador de Reportes</h2>
    <div class="filtros">
      <label>Desde:</label>
      <input type="date" v-model="desde" />
      <label>Hasta:</label>
      <input type="date" v-model="hasta" />
      <select v-model="dispositivo">
        <option value="">Todos los dispositivos</option>
        <option value="medidor1">Medidor 1</option>
        <option value="medidor2">Medidor 2</option>
      </select>
      <button @click="descargarCSV">Descargar CSV</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const desde = ref('')
const hasta = ref('')
const dispositivo = ref('')
function descargarCSV() {
  // lógica para filtrar y descargar
  console.log('Descargando CSV', { desde: desde.value, hasta: hasta.value, dispositivo: dispositivo.value })
}
</script>

<style scoped>
.filtros {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1rem;
}
</style>
