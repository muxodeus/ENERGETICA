<template>
  <div class="config-container">
    <h2>📡 Configurar Medidor</h2>

    <div class="grid">
      <label>
        Gateway ID
        <input v-model="config.gateway_id" placeholder="RB751-CASA" />
      </label>

      <label>
        ID del medidor
        <input v-model="config.medidor_id" placeholder="EPM-123" />
      </label>

      <label>
        IP del medidor
        <input v-model="config.ip" placeholder="192.168.1.50" />
      </label>

      <label>
        Dirección Modbus
        <input v-model.number="config.direccion_modbus" type="number" min="1" placeholder="1" />
      </label>

      <label>
        Intervalo (seg)
        <input v-model.number="config.intervalo_segundos" type="number" min="1" placeholder="60" />
      </label>

      <label>
        Versión
        <input v-model.number="config.version" type="number" min="1" placeholder="1" />
      </label>
    </div>

    <div class="toolbar">
      <select v-model="tipoMedidor">
        <option disabled value="">Seleccionar plantilla de medidor</option>
        <option value="EPM">EPM</option>
        <option value="Schneider">Schneider</option>
        <option value="Estandar34">Estándar-34 (nombres base)</option>
      </select>
      <button @click="aplicarPlantilla" :disabled="!tipoMedidor">Cargar plantilla</button>

      <button @click="agregarRegistro">➕ Agregar registro</button>
      <button @click="limpiarRegistros" :disabled="!config.registros.length">Limpiar</button>

      <button @click="descargarJSON">💾 Descargar JSON</button>
      <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="cargarDesdeArchivo" />
      <button @click="fileInput.value?.click()">📥 Importar JSON</button>

    </div>

    <h3>📋 Registros a leer</h3>
    <div v-if="!config.registros.length" class="muted">Sin registros. Agregá o cargá una plantilla.</div>

    <div v-for="(reg, index) in config.registros" :key="index" class="registro">
      <input v-model="reg.nombre" placeholder="Nombre lógico (ej. tension_L1)" />
      <input v-model.number="reg.offset" type="number" min="0" placeholder="Offset" />
      <input v-model.number="reg.cantidad" type="number" min="1" placeholder="Cantidad" />
      <input v-model.number="reg.escala" type="number" step="0.001" placeholder="Escala" />
      <select v-model="reg.tipo">
        <option value="int">int</option>
        <option value="float">float</option>
      </select>
      <input v-model="reg.unidad" placeholder="Unidad (opcional)" />
      <button class="danger" @click="eliminarRegistro(index)">🗑️</button>
    </div>

    <div class="options">
      <label><input type="checkbox" v-model="retain" /> Retained</label>
      <label>QoS
        <select v-model.number="qos">
          <option :value="0">0</option>
          <option :value="1">1</option>
          <option :value="2">2</option>
        </select>
      </label>
    </div>

    <div class="actions">
      <button :disabled="sending" @click="publicarConfig">
        <span v-if="!sending && result==='idle'">🚀 Publicar al gateway</span>
        <span v-if="sending">Enviando…</span>
        <span v-if="!sending && result==='ok'">✅ Enviado</span>
        <span v-if="!sending && result==='error'">❌ Error</span>
      </button>
      <span class="msg" v-if="message">{{ message }}</span>
    </div>

    <div v-if="errores.length" class="errors">
      <strong>Errores de validación:</strong>
      <ul>
        <li v-for="(e,i) in errores" :key="i">• {{ e }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'ConfigMedidor' })


// ENV: configurar en tu .env
// VITE_GATEWAY_ID=RB751-CASA
// VITE_FUNCTIONS_BASE_URL=https://analitica-energetica.netlify.app
const gatewayIdDefault = import.meta.env.VITE_GATEWAY_ID || ''
const functionsBase = import.meta.env.VITE_FUNCTIONS_BASE_URL || ''

const sending = ref(false)
const result = ref('idle') // 'idle' | 'ok' | 'error'
const message = ref('')
const errores = ref([])
const retain = ref(true)
const qos = ref(1)

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
    } catch (err) {
      errores.value = ['Archivo JSON inválido']
    } finally {
      e.target.value = ''
    }
  }
  reader.readAsText(file)
}

function validarIP(ip) {
  return /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(ip);
}


function validarConfiguracion() {
  const errs = []
  if (!config.value.gateway_id) errs.push('Falta gateway_id')
  if (!config.value.medidor_id) errs.push('Falta medidor_id')
  if (!config.value.ip) errs.push('Falta IP del medidor')
  if (config.value.ip && !validarIP(config.value.ip)) errs.push('IP del medidor inválida')
  if (!Number.isInteger(config.value.direccion_modbus) || config.value.direccion_modbus < 1) errs.push('Dirección Modbus inválida')
  if (!Number.isInteger(config.value.intervalo_segundos) || config.value.intervalo_segundos < 1) errs.push('Intervalo inválido')
  if (!Number.isInteger(config.value.version) || config.value.version < 1) errs.push('Versión inválida')

  if (!Array.isArray(config.value.registros) || config.value.registros.length === 0) {
    errs.push('Debe incluir al menos un registro')
  } else {
    const nombres = new Set()
    config.value.registros.forEach((r, i) => {
      if (!r.nombre) errs.push(`Registro ${i + 1}: falta nombre`)
      if (r.nombre && nombres.has(r.nombre)) errs.push(`Registro ${i + 1}: nombre duplicado (${r.nombre})`)
      if (r.nombre) nombres.add(r.nombre)
      if (!Number.isInteger(r.offset) || r.offset < 0) errs.push(`Registro ${i + 1}: offset inválido`)
      if (!Number.isInteger(r.cantidad) || r.cantidad < 1) errs.push(`Registro ${i + 1}: cantidad inválida`)
      if (typeof r.escala !== 'number') errs.push(`Registro ${i + 1}: escala inválida`)
      if (!['int', 'float'].includes(r.tipo)) errs.push(`Registro ${i + 1}: tipo inválido`)
    })
  }

  return errs
}

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

// Plantillas
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
  // Nombres base de tus 34 parámetros (offsets de ejemplo en 0, para que los edites)
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

const tipoMedidor = ref('')

function aplicarPlantilla() {
  if (!tipoMedidor.value) return
  const arr = plantillas[tipoMedidor.value]
  config.value.registros = JSON.parse(JSON.stringify(arr || []))
  result.value = 'idle'
  message.value = `Plantilla "${tipoMedidor.value}" aplicada.`
}

watch(() => config.value.gateway_id, () => {
  result.value = 'idle'
  message.value = ''
})
fetch("${import.meta.env.BASE_URL}/status-RB751-CASA.json")
  .then(res => res.json())
  .then(data => {
    console.log("Último heartbeat:", data.timestamp);
  });

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
