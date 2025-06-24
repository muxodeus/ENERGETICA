// src/stores/authStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    selectedMeter: null // para guardar el medidor elegido
  }),
  actions: {
    async login(credentials) {
      // Simulación de llamada a la API:
      // Reemplaza esta parte con tu llamada real (por ejemplo, usando axios)
      if (credentials.username === 'demo@mail.com' && credentials.password === 'demo') {
        this.isAuthenticated = true;
        this.user = { email: credentials.username };
        // Guardar estado en localStorage (opcional)
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        throw new Error('Credenciales incorrectas');
      }
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null;
      this.selectedMeter = null;
      localStorage.removeItem('isAuthenticated');
    }
  }
});
