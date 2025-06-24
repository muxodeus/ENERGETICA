<!-- src/components/Fleet/AddMeterModal.vue -->
<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal">
      <h3>Agregar Medidor</h3>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="meterName">Nombre:</label>
          <input id="meterName" v-model="form.name" required />
        </div>
        <div class="form-group">
          <label for="meterLat">Latitud:</label>
          <input id="meterLat" type="number" step="any" v-model.number="form.lat" required />
        </div>
        <div class="form-group">
          <label for="meterLng">Longitud:</label>
          <input id="meterLng" type="number" step="any" v-model.number="form.lng" required />
        </div>
        <div class="form-group">
          <label for="meterStatus">Estado:</label>
          <select id="meterStatus" v-model="form.status">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div class="modal-buttons">
          <button type="button" @click="closeModal">Cancelar</button>
          <button type="submit">Registrar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'meter-added'])

const form = reactive({
  name: '',
  lat: null,
  lng: null,
  status: 'activo'
})

const closeModal = () => {
  emit('update:visible', false)
}

const submitForm = async () => {
  try {
    // Ajustá el endpoint para agregar medidores
    const response = await axios.post('/api/meters', form)
    // Limpia el formulario (opcional)
    form.name = ''
    form.lat = null
    form.lng = null
    form.status = 'activo'
    // Emite el nuevo medidor para que la vista Fleet actualice su lista
    emit('meter-added', response.data)
    closeModal()
  } catch (error) {
    console.error('Error al registrar medidor:', error)
    alert('Error al registrar el medidor.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
}
.form-group {
  margin-bottom: 12px;
}
.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
</style>
