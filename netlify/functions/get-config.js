exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  }

  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  const gateway_id = event.queryStringParameters?.gateway || 'UNKNOWN'

  // Simulación de configuración por gateway_id
  const config = {
    tipo: "configuracion",
    gateway_id,
    medidor_id: "EPM-123",
    ip: "192.168.1.50",
    direccion_modbus: 1,
    intervalo_segundos: 60,
    registros: [
      {
        nombre: "tension_L1",
        offset: 0,
        cantidad: 2,
        escala: 0.1,
        tipo: "float"
      },
      {
        nombre: "corriente_L1",
        offset: 2,
        cantidad: 2,
        escala: 0.01,
        tipo: "float"
      }
    ]
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(config)
  }
}

