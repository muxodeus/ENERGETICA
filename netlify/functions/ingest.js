// ingest.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const token = event.headers['x-ingest-token'];
  if (token !== process.env.INGEST_TOKEN) {
    return { statusCode: 403, body: 'Forbidden' };
  }
  const payload = JSON.parse(event.body);
  const { data, error } = await supabase
    .from('metrics')
    .insert(payload);
  if (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
  return { statusCode: 200, body: JSON.stringify({ inserted: data.length }) };
}

