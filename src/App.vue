<!-- src/App.vue -->
<template>
  <div class="layout">
    <aside :class="{ sidebar: true, collapsed: isSidebarCollapsed }">
      <!-- Se pasa el estado global de autenticación y se envía además un handler para cerrar sesión -->
      <Sidebar 
        :is-collapsed="isSidebarCollapsed" 
        :isAuthenticated="auth.isAuthenticated" 
        @toggleSidebar="toggleSidebar" 
        @logout="auth.logout" />
    </aside>
    <main class="main-content">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Sidebar from './components/Sidebar.vue'

// Obtiene el store global de autenticación (Pinia)
const auth = useAuthStore()

// Se mantiene el estado local del Sidebar (colapsado/expandido)
const isSidebarCollapsed = ref(false)
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

/* Estilos del Sidebar */
.sidebar {
  transition: width 0.3s ease;
  width: 280px;
  flex-shrink: 0;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}
.sidebar.collapsed {
  width: 80px;
}

/* Área principal */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background-color: #f7f9fc;
}
</style>
