<template>
  <div class="no-data-card">
    <p class="icon">📉</p>
    <p class="message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'No hay datos disponibles para mostrar.'
  }
})
</script>

<style scoped>
.no-data-card {
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  background-color: #f7f9fc;
  color: #555;
  border: 1px dashed #bbb;
  font-size: 1rem;
}

.icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.message {
  font-weight: 500;
}
</style>
