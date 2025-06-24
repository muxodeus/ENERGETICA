// src/stores/meterStore.js
import { defineStore } from 'pinia';

export const useMeterStore = defineStore('meter', {
  state: () => ({
    meters: []
  }),
  actions: {
    async fetchMeters() {
      try {
        // Simulación de retardo para obtener la data
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Datos simulados; ajusta según la respuesta de tu API o la lógica de negocio
        this.meters = [
          { id: 1, name: 'Medidor 1', location: 'Edificio A', status: 'Operativo' },
          { id: 2, name: 'Medidor 2', location: 'Edificio B', status: 'En mantenimiento' },
          { id: 3, name: 'Medidor 3', location: 'Planta 1', status: 'Operativo' }
        ];
      } catch (error) {
        console.error('Error al cargar medidores:', error);
      }
    }
  }
});
