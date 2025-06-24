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
        this.meters = [
          {
            id: 1,
            name: 'Medidor 1',
            location: 'Edificio A',
            status: 'Operativo',
            lat: 13.6950,
            lng: -89.2160,
            voltaje: 220,
            corriente: 3.4,
            timestamp: '2025-06-24 20:55'
          },
          {
            id: 2,
            name: 'Medidor 2',
            location: 'Edificio B',
            status: 'En mantenimiento',
            lat: 13.6940,
            lng: -89.2190,
            voltaje: 0,
            corriente: 0,
            timestamp: '2025-06-24 20:54'
          },
          {
            id: 3,
            name: 'Medidor 3',
            location: 'Planta 1',
            status: 'Desconectado',
            lat: 13.6929,
            lng: -89.2182,
            voltaje: null,
            corriente: null,
            timestamp: '2025-06-24 20:52'
          }
        ];
      } catch (error) {
        console.error('Error al cargar medidores:', error);
      }
    }
  }
});
