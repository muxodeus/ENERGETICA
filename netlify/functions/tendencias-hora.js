exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) }
  }

  const medidor_id = event.queryStringParameters?.medidor_id || 'UNKNOWN'
  const desde = event.queryStringParameters?.desde || null
  const hasta = event.queryStringParameters?.hasta || null

  // Stub de datos (lista vacía por ahora)
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, medidor_id, desde, hasta, data: [] })
  }
}
