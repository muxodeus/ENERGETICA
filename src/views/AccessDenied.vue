<template>
  <div class="access-denied">
    <h1>🚫 Acceso Denegado</h1>
    <p>No tienes permisos para ver esta sección.</p>
    <router-link to="/inicio" class="back-link">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.access-denied {
  padding: 4rem;
  text-align: center;
}
.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: #1976d2;
  text-decoration: underline;
}
</style>
