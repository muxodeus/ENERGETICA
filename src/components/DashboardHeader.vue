<!-- src/components/DashboardHeader.vue -->
<template>
  <header class="dashboard-header">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}
.dashboard-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  animation: fadeIn 0.5s ease-out;
}
.dashboard-header p {
  font-size: 1.1rem;
  color: #555;
  animation: slideIn 0.5s ease-out;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
