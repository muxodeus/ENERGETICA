<template>
  <div class="ack">
    <div class="row">
      <span>MQTT:</span>
      <strong :class="estado">{{ estado }}</strong>
    </div>
    <div v-if="ack">
      <div class="row"><span>OK:</span> <strong>{{ ack.ok ? 'Sí' : 'No' }}</strong></div>
      <div class="row" v-if="ack.aplicada_version !== undefined"><span>Versión aplicada:</span> <strong>{{ ack.aplicada_version }}</strong></div>
      <div class="row" v-if="ack.error"><span>Error:</span> <strong class="error">{{ ack.error }}</strong></div>
      <div class="row muted"><span>TS:</span> <span>{{ ack.ts }}</span></div>
    </div>
    <div v-else class="muted">Esperando ACK…</div>
  </div>
</template>

<script setup lang="ts">
import { useMqttAck } from '@/composables/useMqttAck'
const gatewayId = import.meta.env.VITE_GATEWAY_ID
const { estado, ack, errMsg } = useMqttAck(gatewayId)
</script>

<style scoped>
.ack { border: 1px solid #eee; padding: .75rem; border-radius: 8px; display: grid; gap: .4rem; }
.row { display: flex; gap: .5rem; }
.conectado { color: #0a0; }
.error { color: #b00; }
.muted { color: #777; }
</style>
