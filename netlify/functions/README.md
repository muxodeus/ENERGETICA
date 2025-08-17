# IoT Gateway Flow + Netlify Functions

## Variables de entorno requeridas

# Gateway & MQTT
INGEST_URL=
INGEST_TOKEN=
SERIES_URL=
DASHBOARD_TOKEN=
GATEWAY_ID=
DASH_METRIC=
DASH_LIMIT=

# Base de datos (Supabase)
SUPABASE_URL=
SUPABASE_KEY=

## Instalación del flow en Node-RED
1. Copia el contenido de `flow-node-red.json`.
2. En Node-RED → Menú → Importar → Portapapeles → pegar y confirmar.
3. Define las variables en tu `.env` o `settings.js`.
4. **Deploy Full**.
5. Abre `http://<node-red>/ui` para ver el dashboard.

## Publicar configuración desde Vue (Netlify)
1. `ConfigMedidor.vue` envía config vía HTTP/MQTT al receptor en Node-RED.
2. Flow actualiza variables y endpoints sin reiniciar.

