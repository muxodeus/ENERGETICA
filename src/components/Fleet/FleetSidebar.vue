<!-- src/components/Fleet/FleetSidebar.vue -->
<template>
  <aside class="sidebar" :class="{ open: open }">
    <header class="sidebar-header">
      <h3>Mis Medidores</h3>
      <!-- Botón para agregar solo si el rol es admin o engineer -->
      <button v-if="canEdit" @click="onAddMeter">➕ Nuevo</button>
    </header>
    <ul class="meter-list">
      <li v-for="meter in meters" :key="meter.id" @click="viewMeter(meter.id)" class="meter-item">
        <span :class="{ active: meter.status === 'activo' }">●</span>
        {{ meter.name }}
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  meters: Array,
  role: String,
  open: Boolean
})
const emit = defineEmits(['add-meter'])

const router = useRouter()

const viewMeter = (id) => {
  router.push(`/meter/${id}`)
}

const canEdit = computed(() => ['admin', 'engineer'].includes(props.role))

const onAddMeter = () => emit('add-meter')
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #ddd;
  padding: 16px;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
}
.sidebar.open {
  transform: translateX(0);
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.meter-list {
  list-style: none;
  padding: 0;
}
.meter-item {
  padding: 8px 0;
  cursor: pointer;
}
.meter-item span {
  margin-right: 8px;
}
.meter-item .active {
  color: green;
}
</style>
