// netlify/functions/get-config.js
exports.handler = async function(event, context) {
  const AUTH_TOKEN = process.env.CONFIG_ACCESS_TOKEN;

  const authHeader = event.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (token !== AUTH_TOKEN) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const gateway_id = event.queryStringParameters?.gateway || 'UNKNOWN';

  const config = {
    tipo: "configuracion",
    gateway_id,
    medidor_id: "EPM-123",
    ip: "192.168.86.205",
    direccion_modbus: 1,
    intervalo_segundos: 60,
    registros: [
      { nombre: "tension_L1", offset: 1010, cantidad: 2, escala: 0.1, tipo: "float" },
      { nombre: "corriente_L1", offset: 1000, cantidad: 2, escala: 0.01, tipo: "float" }
    ]
  };

  return {
    statusCode: 200,
    body: JSON.stringify(config)
  };
};
