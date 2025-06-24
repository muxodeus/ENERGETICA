// src/composables/useRole.js
import { ref, onMounted } from 'vue'
import axios from 'axios'

export function useRole() {
  const role = ref('visualizer')  // valor por defecto
  const user = ref(null)

  const fetchUserData = async () => {
    try {
      // Ajustá el endpoint a tu API real
      const response = await axios.get('/api/auth/me')
      user.value = response.data
      role.value = response.data.role
    } catch (error) {
      console.error('Error fetching user info:', error)
      // En caso de error, asumimos el rol de visualizador
      role.value = 'visualizer'
    }
  }

  onMounted(() => {
    fetchUserData()
  })

  return { role, user }
}
