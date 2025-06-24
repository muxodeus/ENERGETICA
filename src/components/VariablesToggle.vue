<!-- src/components/VariablesToggle.vue -->
<template>
  <div class="modal-overlay" v-if="visible" @click.self="close">
    <div class="modal-content">
      <h2>Selecciona parámetros</h2>
      <!-- Botones globales para seleccionar o limpiar todo -->
      <div class="global-buttons">
        <button @click="seleccionarTodo">Seleccionar Todo</button>
        <button @click="limpiarTodo">Limpiar Todo</button>
      </div>
      <!-- Agrupamos los parámetros por tipo -->
      <div v-for="group in groupedParameters" :key="group.group" class="group">
         <h3>{{ group.group }}</h3>
         <div class="checkbox-grid">
           <div v-for="param in group.parameters" :key="param.value" class="checkbox-item">
              <input type="checkbox" :id="param.value" v-model="selected[param.value]" />
              <label :for="param.value">{{ param.label }}</label>
           </div>
         </div>
         <div class="group-buttons">
           <button @click="seleccionarGrupo(group.group)">Seleccionar Todo</button>
           <button @click="limpiarGrupo(group.group)">Limpiar Todo</button>
         </div>
      </div>
      <div class="modal-buttons">
        <button @click="apply">Aplicar</button>
        <button @click="close">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

// Definición de las propiedades recibidas por el componente
const props = defineProps({
  visible: Boolean,
  initialSelected: Object
});
const emit = defineEmits(['update:selected', 'close']);

// Definición de los grupos de parámetros
const groupedParameters = [
  {
    group: "Tensiones",
    parameters: [
      { value: "tension1", label: "Tensión Fase 1" },
      { value: "tension2", label: "Tensión Fase 2" },
      { value: "tension3", label: "Tensión Fase 3" },
      { value: "tensionN", label: "Tensión Neutro" }
    ]
  },
  {
    group: "Corrientes",
    parameters: [
      { value: "corriente1", label: "Corriente Fase 1" },
      { value: "corriente2", label: "Corriente Fase 2" },
      { value: "corriente3", label: "Corriente Fase 3" }
    ]
  },
  {
    group: "Otros",
    parameters: [
      { value: "potenciaTotal", label: "Potencia Total" },
      { value: "energia", label: "Energía" },
      { value: "factorPotencia", label: "Factor de Potencia" },
      { value: "distorsion", label: "Distorsión Armónica" }
    ]
  }
];

// Creamos un objeto reactivo para el estado de selección
const selected = reactive({ ...props.initialSelected });

// Funciones para los botones globales
function seleccionarTodo(){
  groupedParameters.forEach(group => {
    group.parameters.forEach(param => {
      selected[param.value] = true;
    });
  });
}
function limpiarTodo(){
  groupedParameters.forEach(group => {
    group.parameters.forEach(param => {
      selected[param.value] = false;
    });
  });
}

// Funciones para seleccionar o limpiar cada grupo
function seleccionarGrupo(groupName){
  const groupObj = groupedParameters.find(g => g.group === groupName);
  if(groupObj) {
    groupObj.parameters.forEach(param => {
      selected[param.value] = true;
    });
  }
}
function limpiarGrupo(groupName){
  const groupObj = groupedParameters.find(g => g.group === groupName);
  if(groupObj) {
    groupObj.parameters.forEach(param => {
      selected[param.value] = false;
    });
  }
}

function apply(){
  emit("update:selected", { ...selected });
  close();
}

function close(){
  emit("close");
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
}
.global-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.group {
  margin-bottom: 1rem;
}
.group h3 {
  margin-bottom: 0.5rem;
}
.group-buttons {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
button {
  padding: 0.4rem 0.8rem;
  border: none;
  background-color: #3498db;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #2980b9;
}
</style>
