// netlify/functions/ingest-mqtt.js
const { Client } = require('pg');

const pg = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

let connected = false;
async function ensureConnect() {
  if (!connected) {
    await pg.connect();
    connected = true;
  }
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { topic, payload } = body;

  if (!topic || !payload || typeof payload !== 'object') {
    return { statusCode: 400, body: 'Missing topic or invalid payload' };
  }

  const ts = payload.timestamp || Math.floor(Date.now() / 1000);
  const tsISO = new Date(ts * 1000).toISOString();

  const lectura = {
    time: tsISO,
    medidor_id: payload.dispositivo || topic.split('/')[1] || 'UNKNOWN',
    id: String(payload.id ?? null),
    voltaje_A: payload.voltaje_A ?? null,
    corriente_A: payload.corriente_A ?? null,
    potencia_total: payload.potencia_total ?? null,
    energia_total: payload.energia_total ?? null
  };

  try {
    await ensureConnect();

    const cols = Object.keys(lectura);
    const vals = Object.values(lectura);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
    const sql = `
      INSERT INTO lecturas (${cols.join(',')})
      VALUES (${placeholders})
    `;

    await pg.query(sql, vals);

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('DB error:', err);
    return { statusCode: 500, body: 'DB Error' };
  }
};
