// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Inicio from '../views/Inicio.vue'
import TiempoReal from '../views/TiempoReal.vue'
import Dashboard from '../views/Dashboard.vue'
import Reportes from '../views/Reportes.vue'
import Configuracion from '../views/Configuracion.vue'
import Tendencias from '../views/Tendencias.vue'
import Anomalias from '../views/Anomalias.vue'
import Estadisticas from '../views/Estadisticas.vue'
import FactorCarga from '../views/FactorCarga.vue'
import Patrones from '../views/Patrones.vue'
import ConsumoEnergetico from '../views/ConsumoEnergetico.vue'
import Fleet from '../views/Fleet.vue'
import MeterDetail from '../views/MeterDetail.vue'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  { path: '/', redirect: '/inicio' },
  { path: '/inicio', name: 'inicio', component: () => import('@/views/Inicio.vue') },  // CORREGIDO: Se agregó la coma aquí
  { path: '/tiempo-real', name: 'tiempo-real', component: TiempoReal, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/reportes', name: 'reportes', component: Reportes, meta: { requiresAuth: true } },
  { path: '/configuracion', name: 'configuracion', component: Configuracion, meta: { requiresAuth: true } },
  { path: '/consumo', name: 'consumo', component: ConsumoEnergetico, meta: { requiresAuth: true } },
  { path: '/historicos/tendencias', name: 'tendencias', component: Tendencias, meta: { requiresAuth: true } },
  { path: '/historicos/estadisticas', name: 'estadisticas', component: Estadisticas, meta: { requiresAuth: true } },
  { path: '/historicos/factor-carga', name: 'factor-carga', component: FactorCarga, meta: { requiresAuth: true } },
  { path: '/historicos/anomalias', name: 'anomalias', component: Anomalias, meta: { requiresAuth: true } },
  { path: '/historicos/patrones', name: 'patrones', component: Patrones, meta: { requiresAuth: true } },
  { path: '/fleet', name: 'fleet', component: Fleet, meta: { requiresAuth: true } },
  { path: '/meter/:id', name: 'MeterDetail', component: MeterDetail, props: true, meta: { requiresAuth: true } },
  { path: '/map', name: 'map', component: () => import('@/components/MapaLeaflet.vue'), meta: { requiresAuth: true } }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'inicio' });
    return;
  }
  next();
});

export default router;
