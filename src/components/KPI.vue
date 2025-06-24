<!-- src/components/KPI.vue -->
<template>
  <div class="kpi-card">
    <h4>{{ label }}</h4>
    <p>{{ value.toFixed(2) }} {{ unit }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: Number,
  unit: String
})
</script>

<style scoped>
.kpi-card {
  background: #f4f7fb;
  border-left: 5px solid #0066cc;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 1rem;
}
h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
}
p {
  font-size: 1.6rem;
  font-weight: bold;
  color: #0066cc;
  margin: 0.2rem 0 0;
}
</style>
