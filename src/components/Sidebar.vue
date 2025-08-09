<template>
  <div class="custom-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="custom-sidebar-header">
      <h1 class="sidebar-title" v-show="!isCollapsed">ANALÍTICA ENERGÉTICA</h1>
      <h1 class="sidebar-title" v-show="isCollapsed">AE</h1>
    </div>
    <nav class="custom-sidebar-menu">
      <ul>
        <!-- Siempre se muestra "Inicio" -->
        <li>
          <router-link to="/inicio" class="menu-item">
            <i class="mdi mdi-home-outline"></i>
            <span class="menu-title" v-show="!isCollapsed">Inicio</span>
          </router-link>
        </li>
        <!-- Sólo si el usuario está autenticado se muestran los demás menús -->
        <template v-if="isAuthenticated">
          <li>
            <router-link to="/tiempo-real" class="menu-item">
              <i class="mdi mdi-clock-outline"></i>
              <span class="menu-title" v-show="!isCollapsed">Tiempo Real</span>
            </router-link>
          </li>
          <li>
            <div class="menu-item non-clickable">
              <i class="mdi mdi-history"></i>
              <span class="menu-title" v-show="!isCollapsed">Históricos</span>
            </div>
            <ul class="submenu" v-show="!isCollapsed">
              <li v-for="(child, cIndex) in menuHistoricos" :key="cIndex">
                <router-link :to="child.href" class="submenu-item">
                  <i :class="child.icon" class="submenu-icon"></i>
                  <span class="submenu-title">{{ child.title }}</span>
                </router-link>
              </li>
            </ul>
          </li>
          <li>
            <router-link to="/reportes" class="menu-item">
              <i class="mdi mdi-file-chart"></i>
              <span class="menu-title" v-show="!isCollapsed">Reportes</span>
            </router-link>
          </li>
          <li>
            <router-link to="/consumo" class="menu-item">
              <i class="mdi mdi-flash-auto"></i>
              <span class="menu-title" v-show="!isCollapsed">Análisis de Consumo</span>
            </router-link>
          </li>
          <li>
            <router-link to="/configuracion" class="menu-item">
              <i class="mdi mdi-cog-outline"></i>
              <span class="menu-title" v-show="!isCollapsed">Configuración</span>
            </router-link>
          </li>
          <li>
  <router-link to="/config" class="menu-item">
    <i class="mdi mdi-cog"></i>
    <span class="menu-title" v-show="!isCollapsed">Configurar Medidores</span>
  </router-link>
</li>

        </template>
      </ul>
    </nav>
    <div class="sidebar-footer">
      <button class="toggle-button" @click="$emit('toggleSidebar')">
        <i v-if="!isCollapsed" class="mdi mdi-chevron-left"></i>
        <i v-else class="mdi mdi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  },
  // Esta propiedad controla la visualización de los menús
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['toggleSidebar'])

const menuHistoricos = [
  { href: '/historicos/tendencias', title: 'Tendencias', icon: 'mdi mdi-trending-up' },
  { href: '/historicos/estadisticas', title: 'Estadísticas', icon: 'mdi mdi-chart-bar' },
  { href: '/historicos/factor-carga', title: 'Factor de Carga', icon: 'mdi mdi-speedometer' },
  { href: '/historicos/anomalias', title: 'Anomalías', icon: 'mdi mdi-alert-circle-outline' },
  { href: '/historicos/patrones', title: 'Patrones', icon: 'mdi mdi-view-list' }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.custom-sidebar {
  background-color: #2c3e50;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-family: 'Poppins', sans-serif;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 280px;
  transition: width 0.3s ease;
  color: #ecf0f1;
}
.custom-sidebar.collapsed {
  width: 80px;
}
.custom-sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(236, 240, 241, 0.3);
  text-align: center;
  background-color: #34495e;
}
.sidebar-title {
  font-size: 1.3rem;
  margin: 0;
  color: #ecf0f1;
}
.custom-sidebar-menu {
  flex-grow: 1;
  padding: 0;
  margin: 0;
  overflow-y: auto;
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
  color: #ecf0f1;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.menu-item:hover {
  background-color: rgba(236, 240, 241, 0.1);
}
.menu-item i {
  font-size: 28px;
  margin-right: 10px;
  color: #3498db;
}
.menu-title {
  font-size: 1rem;
  font-weight: 500;
}
.non-clickable {
  cursor: default;
}
.submenu {
  list-style: none;
  padding-left: 20px;
  margin: 5px 0;
}
.submenu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}
.submenu-item:hover {
  background-color: rgba(236, 240, 241, 0.1);
}
.submenu-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #95a5a6;
}
.sidebar-footer {
  padding: 16px;
  text-align: center;
}
.toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3498db;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 1.8rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
}
.toggle-button:hover {
  background-color: #2980b9;
  transform: scale(1.1);
}
</style>
