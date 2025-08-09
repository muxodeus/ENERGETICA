exports.handler = async (event) => {
  // CORS opcional (si accedes desde otro dominio)
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  }

  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  try {
    if (event.httpMethod === 'GET') {
      const medidor_id = event.queryStringParameters?.medidor_id || 'UNKNOWN'
      // Devuelve datos vacíos pero JSON válido para que tu UI no rompa
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, medidor_id, data: [] })
      }
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      // Podés validar y “guardar” (por ahora solo eco)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, recibido: body })
      }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: String(err) }) }
  }
}
