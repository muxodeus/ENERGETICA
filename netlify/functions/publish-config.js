// netlify/functions/publish-config.js
const mqtt = require('mqtt')

const {
  MQTT_HOST,
  MQTT_PORT = '8884',          // HiveMQ WS seguro suele usar 8884
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MQTT_USE_WS = 'true',        // wss recomendado en Netlify
  MQTT_SECURE = 'true'         // TLS
} = process.env

function connectMqtt() {
  const isWs = MQTT_USE_WS === 'true'
  const isSecure = MQTT_SECURE === 'true'
  const protocol = isWs ? (isSecure ? 'wss' : 'ws') : (isSecure ? 'mqtts' : 'mqtt')
  const url = `${protocol}://${MQTT_HOST}:${MQTT_PORT}`

  return mqtt.connect(url, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    protocolVersion: 4,
    rejectUnauthorized: true,
    connectTimeout: 6000,
    keepalive: 30,
    clientId: `ui-publisher-${Math.random().toString(16).slice(2)}`
  })
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { gateway_id, config, retain = true, qos = 1 } = JSON.parse(event.body || '{}')
    if (!gateway_id || !config) {
      return { statusCode: 400, body: 'gateway_id y config son requeridos' }
    }
    if (typeof config !== 'object' || Array.isArray(config)) {
      return { statusCode: 400, body: 'config debe ser un objeto JSON' }
    }

    const topic = `config/${gateway_id}`
    const payload = JSON.stringify(config)

    const client = connectMqtt()

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout de conexión MQTT')), 8000)
      client.on('connect', () => { clearTimeout(timer); resolve() })
      client.on('error', (err) => { clearTimeout(timer); reject(err) })
    })

    await new Promise((resolve, reject) => {
      client.publish(topic, payload, { qos, retain }, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    client.end(true)

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, published: { topic, qos, retain }, bytes: payload.length })
    }
  } catch (err) {
    return { statusCode: 500, body: `Error publicando: ${err.message || String(err)}` }
  }
}
