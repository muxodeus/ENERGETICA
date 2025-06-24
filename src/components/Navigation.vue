<!-- src/components/Navigation.vue -->
<template>
  <nav class="main-nav">
    <ul>
      <li :class="{ disabled: !authStore.isAuthenticated }">
        <router-link v-if="authStore.isAuthenticated" :to="{ name: 'dashboard' }">
          Dashboard
        </router-link>
        <span v-else>Dashboard</span>
      </li>
      <li :class="{ disabled: !authStore.isAuthenticated }">
        <router-link v-if="authStore.isAuthenticated" :to="{ name: 'reportes' }">
          Reportes
        </router-link>
        <span v-else>Reportes</span>
      </li>
      <li :class="{ disabled: !authStore.isAuthenticated }">
        <router-link v-if="authStore.isAuthenticated" :to="{ name: 'configuracion' }">
          Configuración
        </router-link>
        <span v-else>Configuración</span>
      </li>
      <!-- Añade más elementos de menú según lo necesites -->
    </ul>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();
</script>

<style scoped>
.main-nav ul {
  list-style: none;
  display: flex;
  gap: 1rem;
  padding: 0;
}
.main-nav li {
  font-size: 1rem;
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
