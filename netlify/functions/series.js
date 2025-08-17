// series.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const token = event.headers['x-dashboard-token'];
  if (token !== process.env.DASHBOARD_TOKEN) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const metric = event.queryStringParameters.metric || 'temp';
  const limit = parseInt(event.queryStringParameters.limit || '50', 10);

  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('metric', metric)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
  return { statusCode: 200, body: JSON.stringify(data.reverse()) };
}

