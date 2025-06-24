<!-- src/components/NavigationBar.vue -->
<template>
  <nav class="navbar">
    <router-link to="/" class="nav-item">Inicio</router-link>
    <router-link to="/fleet" class="nav-item">Flota</router-link>
    <router-link to="/reportes" class="nav-item">Reportes</router-link>
    <router-link to="/configuracion" class="nav-item">Configuración</router-link>
    <!-- Agrega otros enlaces según tus rutas -->
  </nav>
</template>

<script setup>
// No necesitas lógica adicional para este ejemplo básico
</script>

<style scoped>
.navbar {
  background-color: #333;
  padding: 10px 20px;
  display: flex;
  align-items: center;
}
.nav-item {
  margin-right: 15px;
  color: #fff;
  text-decoration: none;
  font-weight: bold;
}
.nav-item:hover {
  text-decoration: underline;
}
</style>
