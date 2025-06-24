<!-- src/views/Inicio.vue -->
<template>
  <div class="inicio">
    <!-- Si el usuario NO está autenticado, se muestra el formulario de login -->
    <div v-if="!auth.isAuthenticated" class="login-wrapper">
      <div class="auth-container">
        <div class="energy-flow"></div>
        <h2>Accede a tu cuenta</h2>
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="username">Usuario (correo)</label>
            <input
              id="username"
              v-model="credentials.username"
              type="email"
              placeholder="Ingresa tu correo"
            />
            <span class="error-message" v-if="errors.username">
              {{ errors.username }}
            </span>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="Ingresa tu contraseña"
            />
            <span class="error-message" v-if="errors.password">
              {{ errors.password }}
            </span>
          </div>
          <button type="submit" class="btn-login" :disabled="isLoading">
            {{ isLoading ? 'Verificando...' : 'Ingresar' }}
          </button>
          <div class="global-message" v-if="errorMessage">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>

    <!-- Si el usuario ESTÁ autenticado, se muestra el dashboard -->
    <div v-else class="dashboard">
<header class="inicio-header">
  <div class="header-content">
    <h1>Bienvenido a Analítica Energética</h1>
    <p>Dashboard de Inicio: Visualización de KPIs y estado de medidores</p>
    <div v-if="auth.selectedMeter" class="selected-meter">
      <p>Medidor seleccionado: {{ auth.selectedMeter.name }}</p>
    </div>
    <div v-else class="no-selection">
      <p>Seleccione un medidor de la lista para ver su información y navegar a sus dashboards.</p>
    </div>
  </div>
</header>

      
      <!-- Lista de medidores -->
      <section class="meters-list">
        <h2>Medidores</h2>
        <ul>
          <li
            v-for="meter in meterStore.meters"
            :key="meter.id"
            @click="selectMeter(meter)"
            :class="{
              'active-meter': meter.status === 'Operativo',
              'inactive-meter': meter.status !== 'Operativo'
            }"
          >
            <span class="meter-name">{{ meter.name }}</span>
            - <span class="meter-location">{{ meter.location }}</span>
            • <span class="meter-status">{{ meter.status }}</span>
          </li>
        </ul>
      </section>
      
      <!-- Navegación rápida a subdashboards si hay medidor seleccionado -->
      <section v-if="auth.selectedMeter" class="subdashboard-nav">
        <h2>Acceso rápido</h2>
        <router-link class="nav-button" :to="{ name: 'tiempo-real' }">
          Tiempo Real
        </router-link>
        <router-link class="nav-button" :to="{ name: 'tendencias' }">
          Tendencias
        </router-link>
        <router-link class="nav-button" :to="{ name: 'estadisticas' }">
          Estadísticas
        </router-link>
        <router-link class="nav-button" :to="{ name: 'dashboard' }">
          Dashboard General
        </router-link>
        <button @click="goToMap" class="nav-button">
          Ir al mapa
        </button>
      </section>
      
      <!-- Aquí se podría agregar información adicional del dashboard -->
      <div class="dashboard-content">
        <p>Aquí se mostrará información principal del dashboard.</p>
      </div>
      
      <!-- Botón de logout ubicado en alguna sección visible o en el SideBar (según tu layout) -->
      <!-- Si se requiere que el logout se muestre en el SideBar, éste se deberá mover al componente SideBar -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useMeterStore } from '@/stores/meterStore';

const auth = useAuthStore();
const meterStore = useMeterStore();
const router = useRouter();

// Credenciales para login.
const credentials = ref({
  username: '',
  password: ''
});
const isLoading = ref(false);
const errorMessage = ref('');
const errors = ref({
  username: '',
  password: ''
});

// Validación simple.
const validateLogin = () => {
  let valid = true;
  errors.value.username = credentials.value.username ? '' : 'El usuario es requerido';
  errors.value.password = credentials.value.password ? '' : 'La contraseña es requerida';
  if (!credentials.value.username || !credentials.value.password) valid = false;
  return valid;
};

// Función de login.
const login = async () => {
  if (!validateLogin()) return;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // Simulación de retardo. Reemplaza con llamada real (axios, etc.).
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await auth.login(credentials.value);
    await meterStore.fetchMeters();
    // Redirige a '/inicio' para mostrar el dashboard.
    router.push('/inicio');
  } catch (err) {
    errorMessage.value = err.message || 'Error al iniciar sesión';
  } finally {
    isLoading.value = false;
  }
};

// Selecciona un medidor y lo asigna al store de autenticación.
function selectMeter(meter) {
  auth.selectedMeter = meter;
}

// Función para ir al mapa (ruta configurada para el mapa, usando Leaflet).
function goToMap() {
  router.push('/fleet');
}

// Al montar, si el usuario ya está autenticado, carga los medidores.
onMounted(() => {
  if (auth.isAuthenticated) {
    meterStore.fetchMeters();
  }
});
</script>

<style scoped>
/* Generalidades */
html,
body,
#app {
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

/* Login */
.login-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
.auth-container {
  position: relative;
  width: 400px;
  padding: 2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.energy-flow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(52, 152, 219, 0.3), transparent);
  background-size: 200% 200%;
  animation: shimmerFlow 3s linear infinite;
  z-index: -1;
}
@keyframes shimmerFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.auth-container h2 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 2rem;
}
.form-group {
  margin-bottom: 1.2rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #555;
}
.form-group input {
  width: 100%;
  padding: 0.8rem;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-login {
  width: 100%;
  padding: 0.8rem;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
.btn-login:disabled {
  background: #7fb3d5;
  cursor: not-allowed;
}
.btn-login:hover:not(:disabled) {
  background: #2980b9;
}
.error-message {
  color: red;
  font-size: 1rem;
  margin-top: 0.3rem;
}
.global-message {
  text-align: center;
  margin-top: 1rem;
  font-size: 1rem;
  color: red;
}

/* Dashboard */
.dashboard {
  padding: 2rem;
  background: #f7f9fc;
  min-height: 100vh;
  box-sizing: border-box;
}
.inicio-header {
  text-align: center;
  margin-bottom: 2rem;
}
.header-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.inicio-header h1 {
  font-size: 2.4rem;
  margin-bottom: 0.3rem;
}
.inicio-header p {
  font-size: 1.1rem;
  color: #666;
}
.selected-meter p {
  font-size: 1.1rem;
  color: #3498db;
  font-weight: bold;
  margin: 0.5rem 0;
}
.no-selection p {
  font-size: 1rem;
  color: #888;
  margin-top: 1rem;
}

/* Lista de medidores */
.meters-list {
  margin-top: 2rem;
}
.meters-list ul {
  list-style: none;
  padding: 0;
}
.meters-list li {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.3s;
}
.meters-list li:hover {
  background-color: #f0f0f0;
}
.active-meter {
  background-color: #e8f0fe;
}
.inactive-meter {
  background-color: #fce4ec;
}

/* Navegación a subdashboards */
.subdashboard-nav {
  margin: 2rem 0;
  text-align: center;
}
.nav-button {
  display: inline-block;
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #3498db;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}
.nav-button:hover {
  background-color: #2980b9;
}

/* Contenido adicional del dashboard */
.dashboard-content {
  margin-top: 2rem;
}
</style>
