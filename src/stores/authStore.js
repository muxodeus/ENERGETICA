import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    users: [],           // lista de usuarios (solo accesible para super_admin)
    selectedMeter: null  // { id, name }
  }),
  actions: {
    async login({ username, password }) {
      // Sólo dos cuentas: super_admin y admin
      if (username === 'jose@mail.com' && password === 'recinos') {
        this.user = { email: username, role: 'super_admin' }
      }
      else if (username === 'admin@mail.com' && password === 'admin') {
        this.user = { email: username, role: 'admin' }
      }
      else {
        throw new Error('Credenciales incorrectas')
      }
      this.isAuthenticated = true
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    logout() {
      this.isAuthenticated = false
      this.user = null
      this.users = []
      this.selectedMeter = null
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('user')
    },

    hydrate() {
      const auth = localStorage.getItem('isAuthenticated')
      const user = localStorage.getItem('user')
      if (auth === 'true' && user) {
        this.isAuthenticated = true
        this.user = JSON.parse(user)
      }
    },

    // sólo super_admin
    async fetchUsers() {
      if (this.user?.role !== 'super_admin') return
      const { data } = await axios.get('/api/users')
      this.users = data
    },

    async createUser(payload) {
      if (this.user?.role !== 'super_admin') throw new Error('No autorizado')
      const { data } = await axios.post('/api/users', payload)
      this.users.push(data)
    },

    // …aquí podrías añadir updateUser y deleteUser…
  }
})
