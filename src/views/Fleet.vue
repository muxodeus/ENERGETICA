<!-- src/views/Fleet.vue -->
<template>
  <div class="fleet-container">
    <!-- Sidebar de medidores -->
    <FleetSidebar :meters="meters" :role="role" :open="sidebarOpen" @add-meter="toggleModal" />

    <!-- Contenedor del mapa -->
    <div class="map-wrapper">
      <MapView :meters="meters" :role="role" />
    </div>

    <!-- Modal para agregar medidor -->
    <AddMeterModal v-model:visible="isModalVisible" @meter-added="onMeterAdded" />
  </div>
  <NoDataCard
  v-if="noData"
  message="No hay consumo registrado para este medidor aún."
/>

<ApexChart
  v-else
  :options="chartOptions"
  :series="chartSeries"
/>

</template>

<script setup>
import { ref } from 'vue'
import FleetSidebar from '@/components/Fleet/FleetSidebar.vue'
import MapView from '@/components/Map/MapView.vue'
import AddMeterModal from '@/components/Fleet/AddMeterModal.vue'
import { useRole } from '@/composables/useRole'
import NoDataCard from '@/components/shared/NoDataCard.vue'



// Obtención del rol y usuario desde backend
const { role } = useRole()

// Lista de medidores (idealmente la obtendrías del backend con un fetch, acá usamos datos dummy)
const meters = ref([
  { id: 1, name: 'Medidor A', lat: 13.715, lng: -89.200, status: 'activo' },
  { id: 2, name: 'Planta B', lat: 13.730, lng: -89.180, status: 'inactivo' },
  { id: 3, name: 'Nodo C', lat: 13.710, lng: -89.250, status: 'activo' }
])

const sidebarOpen = ref(true)
const isModalVisible = ref(false)

const toggleModal = () => {
  isModalVisible.value = true
}

const onMeterAdded = (newMeter) => {
  // Se espera que el backend retorne el medidor con un id asignado
  meters.value.push(newMeter)
}
</script>

<style scoped>
.fleet-container {
  display: flex;
  height: 100vh;
}
.map-wrapper {
  flex: 1;
  position: relative;
}
</style>
