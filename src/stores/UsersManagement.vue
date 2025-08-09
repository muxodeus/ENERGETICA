<template>
  <div v-if="auth.user.role==='super_admin'">
    <h2>Gestión de Usuarios</h2>
    <form @submit.prevent="onCreate">
      <input v-model="email" type="email" placeholder="Email" required/>
      <input v-model="password" type="password" placeholder="Password" required/>
      <select v-model="role">
        <option value="admin">admin</option>
        <option value="super_admin">super_admin</option>
      </select>
      <button>Crear</button>
    </form>

    <ul>
      <li v-for="u in auth.users" :key="u.id">
        {{ u.email }} – {{ u.role }}
        <!-- botones Edit/Delete aquí -->
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
const auth   = useAuthStore()
const email   = ref('')
const password= ref('')
const role   = ref('admin')

onMounted(() => auth.fetchUsers())

async function onCreate() {
  await auth.createUser({ email: email.value, password: password.value, role: role.value })
  email.value = password.value = ''
}
</script>
