<!-- src/components/HeaderTop.vue -->
<template>
  <div v-if="auth.selectedMeter" class="selected-meter-global">
    <span>Medidor seleccionado: {{ auth.selectedMeter.name }}</span>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()
</script>

<style scoped>
.selected-meter-global {
  padding: 0.5rem 1rem;
  background-color: #ecf0f1;
  color: #2980b9;
  font-weight: 600;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>
