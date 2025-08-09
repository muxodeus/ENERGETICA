// src/composables/useMqttAck.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { connect } from 'mqtt/dist/mqtt.min' // versión browser

export function useMqttAck(gatewayId: string) {
  const estado = ref<'desconectado'|'conectado'|'error'>('desconectado')
  const ack = ref<{ ok?: boolean; aplicada_version?: number; error?: string; ts?: string } | null>(null)
  const errMsg = ref<string>('')

  // Variables de entorno (expuestas al navegador: cuidado con credenciales)
  const host = import.meta.env.VITE_MQTT_HOST
  const port = import.meta.env.VITE_MQTT_WSS_PORT || '8884'
  const username = import.meta.env.VITE_MQTT_RO_USER
  const password = import.meta.env.VITE_MQTT_RO_PASS

  let client: any

  onMounted(() => {
    const url = `wss://${host}:${port}`
    client = connect(url, {
      username,
      password,
      clientId: `ui-ack-${gatewayId}-${Math.random().toString(16).slice(2)}`,
      protocolVersion: 4,
      keepalive: 30,
      reconnectPeriod: 3000
    })

    client.on('connect', () => {
      estado.value = 'conectado'
      client.subscribe(`config_ack/${gatewayId}`, { qos: 1 })
    })

    client.on('message', (topic: string, payload: Uint8Array) => {
      if (topic === `config_ack/${gatewayId}`) {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload))
          ack.value = { ...data, ts: new Date().toISOString() }
        } catch (e: any) {
          errMsg.value = e?.message || 'Error parseando ACK'
        }
      }
    })

    client.on('error', (err: any) => {
      estado.value = 'error'
      errMsg.value = err?.message || 'Error MQTT'
    })
  })

  onBeforeUnmount(() => {
    try { client?.end(true) } catch {}
  })

  return { estado, ack, errMsg }
}
