<template>
  <div class="custom-sidebar">
    <div class="custom-sidebar-header">
      <!-- Si no está colapsado se muestra el título completo; de lo contrario, una abreviación -->
      <h1 class="sidebar-title" v-if="!isCollapsed">ANALÍTICA ENERGÉTICA</h1>
      <h1 class="sidebar-title" v-else>AE</h1>
      <!-- Botón para colapsar/expandir -->
      <button class="toggle-button" @click="$emit('toggleSidebar')">
        <i v-if="!isCollapsed" class="mdi mdi-chevron-left"></i>
        <i v-else class="mdi mdi-chevron-right"></i>
      </button>
    </div>
    <nav class="custom-sidebar-menu">
      <ul>
        <li v-for="(item, index) in menu" :key="index">
          <a :href="item.href ? item.href : '#'" class="menu-item">
            <i :class="item.icon"></i>
            <!-- Sólo se muestran los títulos si el menú está expandido -->
            <span v-if="!isCollapsed" class="menu-title">{{ item.title }}</span>
          </a>
          <!-- Si el item tiene submenú y el menú está expandido, se muestran -->
          <ul v-if="item.child && !isCollapsed" class="submenu">
            <li v-for="(child, cIndex) in item.child" :key="cIndex">
              <a :href="child.href" class="submenu-item">
                {{ child.title }}
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['toggleSidebar'])

const menu = [
  { href: '/', title: 'Tiempo Real', icon: 'mdi mdi-clock-outline' },
  {
    title: 'Históricos',
    icon: 'mdi mdi-history',
    child: [
      { href: '/historicos/tendencias', title: 'Tendencias' },
      { href: '/historicos/estadisticas', title: 'Estadísticas' },
      { href: '/historicos/factor-carga', title: 'Factor de Carga' },
      { href: '/historicos/anomalias', title: 'Anomalías' },
      { href: '/historicos/patrones', title: 'Patrones' }
    ]
  },
  { href: '/reportes', title: 'Reportes', icon: 'mdi mdi-file-chart' },
  { href: '/consumo', title: 'Análisis de Consumo', icon: 'mdi mdi-flash-auto' },
  { href: '/configuracion', title: 'Configuración', icon: 'mdi mdi-cog-outline' }
]
</script>

<style scoped>
.custom-sidebar {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-family: Arial, sans-serif;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Encabezado del Sidebar */
.custom-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.sidebar-title {
  font-size: 1.2rem;
  margin: 0;
  color: #333;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #007bff;
}

/* Menú principal */
.custom-sidebar-menu {
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.custom-sidebar-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.menu-item i {
  font-size: 28px;
  margin-right: 10px;
  color: #007bff;
}

.menu-title {
  font-size: 1rem;
  font-weight: 500;
}

.submenu {
  list-style: none;
  padding-left: 20px;
  margin: 5px 0;
}

.submenu-item {
  display: block;
  padding: 8px 16px;
  text-decoration: none;
  color: #666;
  font-size: 0.9rem;
  border-radius: 4px;
}

.submenu-item:hover {
  background-color: #f9f9f9;
}
</style>
