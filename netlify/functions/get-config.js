// netlify/functions/get-config.js
const fs = require('fs');
const path = require('path');

exports.handler = async function(event) {
  try {
    const tokensEnv = process.env.CONFIG_TOKENS || '{}';
    const tokens = JSON.parse(tokensEnv); // {"RB751-CASA":"TOKEN_RB751_CASA", ...}

    const authHeader = event.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const gateway_id = event.queryStringParameters?.gateway || '';

    if (!gateway_id) {
      return json(400, { error: 'Missing gateway param' });
    }

    const expected = tokens[gateway_id];
    if (!expected || token !== expected) {
      return json(401, { error: 'Unauthorized' });
    }

    const file = path.join(__dirname, 'configs', `${gateway_id}.json`);
    if (!fs.existsSync(file)) {
      return json(404, { error: 'Config not found for gateway', gateway_id });
    }

    const raw = fs.readFileSync(file, 'utf8');
    // Validación mínima JSON
    JSON.parse(raw);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      },
      body: raw
    };
  } catch (err) {
    return json(500, { error: String(err) });
  }
};

function json(code, obj) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(obj)
  };
}
