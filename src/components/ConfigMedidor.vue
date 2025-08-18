<template>
  <div class="config-container">
    <!-- Toolbar: agregar, limpiar, plantillas, importar/exportar -->
    <div class="toolbar">
      <button @click="agregarRegistro">Agregar registro</button>
      <button @click="limpiarRegistros">Limpiar registros</button>

      <div class="options">
        <select v-model="tipoMedidor">
          <option value="">— Plantilla —</option>
          <option
            v-for="(arr, key) in plantillas"
            :key="key"
            :value="key"
          >
            {{ key }}
          </option>
        </select>
        <button @click="aplicarPlantilla">Aplicar</button>
      </div>

      <div class="actions">
        <button @click="descargarJSON">Descargar JSON</button>
        <button @click="fileInput.click()">Cargar JSON</button>
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept=".json"
          @change="cargarDesdeArchivo"
        />
      </div>
    </div>

    <!-- Configuración general -->
    <div class="grid">
      <label>
        Gateway ID
        <input
          type="text"
          v-model="config.gateway_id"
          placeholder="gateway_id"
        />
      </label>
      <label>
        Medidor ID
        <input
          type="text"
          v-model="config.medidor_id"
          placeholder="medidor_id"
        />
      </label>
      <label>
        IP del medidor
        <input
          type="text"
          v-model="config.ip"
          placeholder="192.168.1.10"
        />
      </label>
      <label>
        Dirección Modbus
        <input
          type="number"
          v-model.number="config.direccion_modbus"
          min="1"
        />
      </label>
      <label>
        Intervalo (segundos)
        <input
          type="number"
          v-model.number="config.intervalo_segundos"
          min="1"
        />
      </label>
      <label>
        Versión
        <input
          type="number"
          v-model.number="config.version"
          min="1"
        />
      </label>
      <label>
        Retain
        <input
          type="checkbox"
          v-model="retain"
        />
      </label>
      <label>
        QoS
        <select v-model.number="qos">
          <option :value="0">0</option>
          <option :value="1">1</option>
          <option :value="2">2</option>
        </select>
      </label>
    </div>

    <!-- Lista dinámica de registros -->
    <div v-for="(r, i) in config.registros" :key="i" class="registro">
      <input
        type="text"
        v-model="r.nombre"
        placeholder="nombre"
      />
      <input
        type="number"
        v-model.number="r.offset"
        placeholder="offset"
        min="0"
      />
      <input
        type="number"
        v-model.number="r.cantidad"
        placeholder="cantidad"
        min="1"
      />
      <input
        type="number"
        v-model.number="r.escala"
        placeholder="escala"
        step="any"
      />
      <select v-model="r.tipo">
        <option value="int">int</option>
        <option value="float">float</option>
      </select>
      <input
        type="text"
        v-model="r.unidad"
        placeholder="unidad"
      />
      <button @click="eliminarRegistro(i)">🗑️</button>
    </div>

    <!-- Botón publicar -->
    <div class="actions">
      <button
        :disabled="sending"
        @click="publicarConfig"
      >
        Publicar configuración
      </button>
    </div>

    <!-- Errores de validación -->
    <div
      v-if="errores.length"
      class="errors danger"
    >
      <div v-for="(e, idx) in errores" :key="idx">
        {{ e }}
      </div>
    </div>

    <!-- Mensaje resultado -->
    <div
      v-if="message"
      :class="['msg', result === 'error' ? 'danger' : '']"
    >
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
defineOptions({ name: 'ConfigMedidor' })

// Variables de entorno en .env
const gatewayIdDefault = import.meta.env.VITE_GATEWAY_ID || ''
const functionsBase = import.meta.env.VITE_FUNCTIONS_BASE_URL || ''

// Estado reactivo
const sending = ref(false)
const result = ref('idle')
const message = ref('')
const errores = ref([])
const retain = ref(true)
const qos = ref(1)
const tipoMedidor = ref('')
const fileInput = ref(null)

const config = ref({
  tipo: 'configuracion',
  version: 1,
  gateway_id: gatewayIdDefault,
  medidor_id: '',
  ip: '',
  direccion_modbus: 1,
  intervalo_segundos: 60,
  registros: []
})

// Validación de IP
function validarIP(ip) {
  return /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(ip)
}

// Validar toda la configuración
function validarConfiguracion() {
  const errs = []
  if (!config.value.gateway_id) errs.push('Falta gateway_id')
  if (!config.value.medidor_id) errs.push('Falta medidor_id')
  if (!config.value.ip) errs.push('Falta IP del medidor')
  if (config.value.ip && !validarIP(config.value.ip)) errs.push('IP del medidor inválida')
  if (!Number.isInteger(config.value.direccion_modbus) || config.value.direccion_modbus < 1)
    errs.push('Dirección Modbus inválida')
  if (!Number.isInteger(config.value.intervalo_segundos) || config.value.intervalo_segundos < 1)
    errs.push('Intervalo inválido')
  if (!Number.isInteger(config.value.version) || config.value.version < 1)
    errs.push('Versión inválida')

  if (!Array.isArray(config.value.registros) || config.value.registros.length === 0) {
    errs.push('Debe incluir al menos un registro')
  } else {
    const nombres = new Set()
    config.value.registros.forEach((r, i) => {
      if (!r.nombre) errs.push(`Registro ${i + 1}: falta nombre`)
      if (r.nombre && nombres.has(r.nombre))
        errs.push(`Registro ${i + 1}: nombre duplicado (${r.nombre})`)
      if (r.nombre) nombres.add(r.nombre)
      if (!Number.isInteger(r.offset) || r.offset < 0)
        errs.push(`Registro ${i + 1}: offset inválido`)
      if (!Number.isInteger(r.cantidad) || r.cantidad < 1)
        errs.push(`Registro ${i + 1}: cantidad inválida`)
      if (typeof r.escala !== 'number')
        errs.push(`Registro ${i + 1}: escala inválida`)
      if (!['int', 'float'].includes(r.tipo))
        errs.push(`Registro ${i + 1}: tipo inválido`)
    })
  }
  return errs
}

// CRUD de registros
function agregarRegistro() {
  config.value.registros.push({
    nombre: '',
    offset: 0,
    cantidad: 2,
    escala: 1,
    tipo: 'int',
    unidad: ''
  })
}

function eliminarRegistro(index) {
  config.value.registros.splice(index, 1)
}

function limpiarRegistros() {
  config.value.registros = []
}

// Descargar configuración como JSON
function descargarJSON() {
  const blob = new Blob([JSON.stringify(config.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${config.value.gateway_id || 'gateway'}-${config.value.medidor_id || 'medidor'}-config.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Cargar configuración desde archivo
function cargarDesdeArchivo(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result)
      if (parsed && typeof parsed === 'object') {
        config.value = {
          tipo: 'configuracion',
          version: parsed.version ?? 1,
          gateway_id: parsed.gateway_id ?? gatewayIdDefault,
          medidor_id: parsed.medidor_id ?? '',
          ip: parsed.ip ?? '',
          direccion_modbus: parsed.direccion_modbus ?? 1,
          intervalo_segundos: parsed.intervalo_segundos ?? 60,
          registros: Array.isArray(parsed.registros) ? parsed.registros : []
        }
        errores.value = []
        result.value = 'idle'
        message.value = 'Configuración cargada desde archivo.'
      }
    } catch {
      errores.value = ['Archivo JSON inválido']
    } finally {
      e.target.value = ''
    }
  }
  reader.readAsText(file)
}

// Publicar configuración a Netlify Function
async function publicarConfig() {
  errores.value = validarConfiguracion()
  if (errores.value.length) {
    result.value = 'error'
    message.value = 'Revisá los errores de validación.'
    return
  }

  sending.value = true
  result.value = 'idle'
  message.value = ''

  const body = {
    gateway_id: config.value.gateway_id,
    retain: retain.value,
    qos: qos.value,
    config: config.value
  }

  try {
    const url = `${functionsBase}/.netlify/functions/publish-config`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || data?.message || res.statusText)
    result.value = 'ok'
    message.value = `Publicado en ${data?.published?.topic || 'topic'} (qos ${data?.published?.qos}, retained ${retain.value}).`
  } catch (e) {
    result.value = 'error'
    message.value = e?.message || 'Error publicando'
  } finally {
    sending.value = false
  }
}

// Plantillas de registros
const plantillas = {
  EPM: [
    { nombre: 'tension_L1', offset: 0, cantidad: 2, escala: 0.1, tipo: 'float', unidad: 'V' },
    { nombre: 'corriente_L1', offset: 2, cantidad: 2, escala: 0.01, tipo: 'float', unidad: 'A' },
    { nombre: 'potencia_activa_total', offset: 4, cantidad: 2, escala: 1, tipo: 'int', unidad: 'W' }
  ],
  Schneider: [
    { nombre: 'voltaje_A', offset: 10, cantidad: 2, escala: 0.1, tipo: 'float', unidad: 'V' },
    { nombre: 'energia_activa', offset: 12, cantidad: 2, escala: 1, tipo: 'int', unidad: 'Wh' }
  ],
  Estandar34: [
    { nombre: 'tension_L1', offset: 0, cantidad: 2, escala: 0.1, tipo: 'float', unidad: 'V' },
    { nombre: 'tension_L2', offset: 0, cantidad: 2, escala: 0.1, tipo: 'float', unidad: 'V' },
    { nombre: 'tension_L3', offset: 0, cantidad: 2, escala: 0.1, tipo: 'float', unidad: 'V' },
    { nombre: 'tension_L12', offset: 0, cantidad: 2, escala: 0.1, tipo: 'float', unidad: 'V' },
    { nombre: 'tension_L23', offset: 0, cantidad: 2, escala: 0.1, tipo: 'float', unidad: 'V' },
    { nombre: 'tension_L31', offset: 0, cantidad: 2, escala: 0.1, tipo: 'float', unidad: 'V' },
    { nombre: 'corriente_L1', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: 'A' },
    { nombre: 'corriente_L2', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: 'A' },
    { nombre: 'corriente_L3', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: 'A' },
    { nombre: 'corriente_N',  offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: 'A' },
    { nombre: 'potencia_activa_total',   offset: 0, cantidad: 2, escala: 1, tipo: 'float', unidad: 'W' },
    { nombre: 'potencia_reactiva_total', offset: 0, cantidad: 2, escala: 1, tipo: 'float', unidad: 'var' },
    { nombre: 'potencia_aparente_total', offset: 0, cantidad: 2, escala: 1, tipo: 'float', unidad: 'VA' },
    { nombre: 'potencia_activa_L1', offset: 0, cantidad: 2, escala: 1, tipo: 'float', unidad: 'W' },
    { nombre: 'potencia_activa_L2', offset: 0, cantidad: 2, escala: 1, tipo: 'float', unidad: 'W' },
    { nombre: 'potencia_activa_L3', offset: 0, cantidad: 2, escala: 1, tipo: 'float', unidad: 'W' },
    { nombre: 'thd_tension_L1', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: '%' },
    { nombre: 'thd_tension_L2', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: '%' },
    { nombre: 'thd_tension_L3', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: '%' },
    { nombre: 'thd_corriente_L1', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: '%' },
    { nombre: 'thd_corriente_L2', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: '%' },
    { nombre: 'thd_corriente_L3', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: '%' },
    { nombre: 'desbalance_tension',  offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: '%' },
    { nombre: 'desbalance_corriente', offset: 0, cantidad: 2, escala: 0.01, tipo: 'float', unidad: '%' },
    { nombre: 'fp_L1', offset: 0, cantidad: 2, escala: 0.001, tipo: 'float', unidad: '' },
    { nombre: 'fp_L2', offset: 0, cantidad: 2, escala: 0.001, tipo: 'float', unidad: '' },
    { nombre: 'fp_L3', offset: 0, cantidad: 2, escala: 0.001, tipo: 'float', unidad: '' },
    { nombre: 'fp_total', offset: 0, cantidad: 2, escala: 0.001, tipo: 'float', unidad: '' }
  ]
}

// Aplicar plantilla seleccionada
function aplicarPlantilla() {
  if (!tipoMedidor.value) return
  const arr = plantillas[tipoMedidor.value]
  config.value.registros = JSON.parse(JSON.stringify(arr || []))
  result.value = 'idle'
  message.value = `Plantilla "${tipoMedidor.value}" aplicada.`
}

// Reset mensaje al cambiar gateway_id
watch(() => config.value.gateway_id, () => {
  result.value = 'idle'
  message.value = ''
})

// Fetch opcional de status
fetch(`${import.meta.env.BASE_URL}/status-${gatewayIdDefault || 'RB751-CASA'}.json`)
  .then(res => res.json())
  .then(data => {
    console.log('Último heartbeat:', data.timestamp)
  })
</script>

<style scoped>
.config-container { display: grid; gap: 1rem; max-width: 980px; }
.grid { display: grid; gap: .75rem; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid label { display: grid; gap: .25rem; font-size: .9rem; }
.registro { display: grid; gap: .5rem; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr auto; align-items: center; margin-bottom: .5rem; }
.toolbar, .actions, .options { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.hidden { display: none; }
.muted { color: #777; font-style: italic; }
.errors { background: #fff4f4; border: 1px solid #f4cccc; padding: .5rem .75rem; border-radius: 6px; }
.danger { background: #ffd9d9; border: 1px solid #ffb3b3; }
.msg { color: #555; }
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
  .registro { grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr auto; }
}
</style>
```
