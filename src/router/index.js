import { createRouter, createWebHistory } from 'vue-router'
import Inicio from '../views/Inicio.vue'
import TiempoReal from '../views/TiempoReal.vue'
import Dashboard from '../views/Dashboard.vue'
import Reportes from '../views/Reportes.vue'
import Configuracion from '../views/Configuracion.vue'
import Tendencias from '../views/Tendencias.vue'
import Anomalias from '../views/Anomalias.vue'
import Unifilar from '../views/Unifilar.vue'
import Estadisticas from '../views/Estadisticas.vue'
import FactorCarga from '../views/FactorCarga.vue'
import Patrones from '../views/Patrones.vue'
import ConsumoEnergetico from '../views/ConsumoEnergetico.vue'
import Fleet from '../views/Fleet.vue'
import MeterDetail from '../views/MeterDetail.vue'
import { useAuthStore } from '@/stores/authStore'
import NewMapView from '@/components/Map/NewMapView.vue'
import MedidorBombaAgua from '@/components/MedidorBombaAgua.vue'
import ConfigMedidor from '../views/ConfigMedidor.vue' // ajusta la ruta si está en otra carpeta



const routes = [
  { path: '/', redirect: '/inicio' },
  { path: '/inicio', name: 'inicio', component: Inicio },
  { path: '/tiempo-real', name: 'tiempo-real', component: TiempoReal, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/reportes', name: 'reportes', component: Reportes, meta: { requiresAuth: true } },
  { path: '/configuracion', name: 'configuracion', component: Configuracion, meta: { requiresAuth: true } },
  { path: '/consumo', name: 'consumo', component: ConsumoEnergetico, meta: { requiresAuth: true } },
  { path: '/historicos/tendencias/:meterName?', name: 'tendencias', component: Tendencias, meta: { requiresAuth: true } },
  { path: '/historicos/estadisticas', name: 'estadisticas', component: Estadisticas, meta: { requiresAuth: true } },
  { path: '/historicos/factor-carga', name: 'factor-carga', component: FactorCarga, meta: { requiresAuth: true } },
  { path: '/historicos/anomalias', name: 'anomalias', component: Anomalias, meta: { requiresAuth: true } },
  { path: '/historicos/patrones', name: 'patrones', component: Patrones, meta: { requiresAuth: true } },
  { path: '/fleet', name: 'fleet', component: Fleet, meta: { requiresAuth: true } },
  { path: '/meter/:id', name: 'MeterDetail', component: MeterDetail, props: true, meta: { requiresAuth: true } },
  //{ path: '/map', name: 'map', component: () => import('@/components/MapaLeaflet.vue'), meta: { requiresAuth: true } },
  { path: '/medidor/:id', name: 'MeterDetailDynamic', component: () => import('@/views/MeterDetail.vue'), meta: { requiresAuth: true } },
  { path: '/403', name: 'AccessDenied', component: () => import('@/views/AccessDenied.vue') },
    {
    path: '/map',
    name: 'NewMapView',
    component: NewMapView
  },
    {
    path: '/bomba-agua',
    name: 'MedidorBombaAgua',
    component: MedidorBombaAgua
  },
  { path: '/unifilar/:id', name: 'Unifilar', component: Unifilar }
 
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/config', name: 'config-medidor', component: ConfigMedidor }
  ]
})


router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'inicio' })
  }
  if (to.meta.onlyMasterAdmin && authStore.user?.role !== 'admin_master') {
    return next({ name: 'AccessDenied' })
  }
  next()
})

export default createRouter({
  history: createWebHistory(),
  routes
})
