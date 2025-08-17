#!/usr/bin/env bash
set -euo pipefail

# ========== Config por entorno (exportá antes de correr) ==========
SITE_URL="${SITE_URL:-https://analitica-energetica.netlify.app}"

# API de tendencias (si no se define, se arma con SITE_URL y MEDIDOR_ID)
MEDIDOR_ID="${MEDIDOR_ID:-XYZ}"
API_TENDENCIAS_URL="${API_TENDENCIAS_URL:-${SITE_URL}/api/tendencias?medidor_id=${MEDIDOR_ID}}"

# Netlify Function de publicación (si existe)
PUBLISH_FN_URL="${PUBLISH_FN_URL:-${SITE_URL}/.netlify/functions/publish-config}"

# MQTT (HiveMQ Cloud típico)
BROKER_HOST="${BROKER_HOST:-tu-instancia.s2.eu.hivemq.cloud}"
BROKER_PORT="${BROKER_PORT:-8883}"
BROKER_USER="${BROKER_USER:-}"
BROKER_PASS="${BROKER_PASS:-}"
BROKER_CAPATH="${BROKER_CAPATH:-/etc/ssl/certs}"

# Topics
GATEWAY_ID="${GATEWAY_ID:-RB751-CASA}"
TOPIC_CONFIG="config/${GATEWAY_ID}"
TOPIC_CONFIG_ACK="config_ack/${GATEWAY_ID}"
TOPIC_DATA="${TOPIC_DATA:-energia/#}"

# Opcional: ejecutar test de publicación contra la Function
TEST_PUBLISH="${TEST_PUBLISH:-false}"

# ========== Helpers ==========
green(){ printf "\033[32m%s\033[0m\n" "$*"; }
red(){ printf "\033[31m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }
blue(){ printf "\033[34m%s\033[0m\n" "$*"; }

need() {
  command -v "$1" >/dev/null 2>&1 || { red "Falta comando requerido: $1"; exit 1; }
}

# ========== Checks ==========
check_frontend() {
  blue "==> Check Frontend ${SITE_URL}"
  local code ct
  code=$(curl -sS -o /dev/null -w "%{http_code}" "${SITE_URL}")
  if [[ "$code" != "200" ]]; then
    red "Frontend HTTP ${code} (esperado 200)"; return 1
  fi
  ct=$(curl -sSI "${SITE_URL}" | awk -F': ' 'BEGIN{IGNORECASE=1}/^content-type/{print $2; exit}' | tr -d '\r')
  echo "Content-Type: ${ct}"
  if [[ "${ct}" != text/html* ]]; then
    yellow "Advertencia: Content-Type no es text/html (ok si hay CDN intermedio)"
  fi
  green "Frontend OK"
}

check_api_tendencias() {
  blue "==> Check API Tendencias ${API_TENDENCIAS_URL}"
  local headers bodyfile code ct
  bodyfile="$(mktemp)"
  headers=$(curl -sS -D - -o "${bodyfile}" "${API_TENDENCIAS_URL}" || true)
  code=$(printf "%s" "${headers}" | awk 'BEGIN{IGNORECASE=1}/^HTTP/{code=$2}END{print code}')
  ct=$(printf "%s" "${headers}" | awk -F': ' 'BEGIN{IGNORECASE=1}/^content-type/{print $2; exit}' | tr -d '\r')
  echo "HTTP ${code} | Content-Type: ${ct}"
  if [[ "${ct}" != application/json* ]]; then
    red "API devolvió Content-Type '${ct}' (debería ser application/json). Posible redirect o 404 HTML."
    echo "Primeros bytes de respuesta:"
    head -c 200 "${bodyfile}" | sed 's/[[:cntrl:]]//g'; echo
    rm -f "${bodyfile}"
    return 1
  fi
  # Validar que es JSON parseable
  if ! jq . >/dev/null 2>&1 < "${bodyfile}"; then
    red "Respuesta no es JSON válido"
    head -c 200 "${bodyfile}" | sed 's/[[:cntrl:]]//g'; echo
    rm -f "${bodyfile}"
    return 1
  fi
  green "API Tendencias OK"
  rm -f "${bodyfile}"
}

check_function_publish() {
  blue "==> Check Netlify Function publish-config ${PUBLISH_FN_URL}"
  if [[ "${TEST_PUBLISH}" != "true" ]]; then
    yellow "TEST_PUBLISH=false (omitido). Exportá TEST_PUBLISH=true para ejecutar."
    return 0
  fi
  local payload code bodyfile
  bodyfile="$(mktemp)"
  payload=$(jq -nc --arg gw "${GATEWAY_ID}" '
    {
      gateway_id: $gw,
      retain: true,
      qos: 1,
      config: {
        tipo:"configuracion",
        version:1,
        gateway_id:$gw,
        medidor_id:"EPM-TEST",
        ip:"192.168.1.99",
        direccion_modbus:1,
        intervalo_segundos:60,
        registros:[
          {nombre:"tension_L1",offset:0,cantidad:2,escala:0.1,tipo:"float"}
        ]
      }
    }')

  code=$(curl -sS -o "${bodyfile}" -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -X POST \
    -d "${payload}" \
    "${PUBLISH_FN_URL}")

  echo "HTTP ${code}"
  if [[ "${code}" != "200" ]]; then
    red "Function respondió ${code}"
    cat "${bodyfile}"; echo
    rm -f "${bodyfile}"
    return 1
  fi
  if ! jq . < "${bodyfile}" >/dev/null 2>&1; then
    red "Respuesta de Function no es JSON"
    cat "${bodyfile}"; echo
    rm -f "${bodyfile}"
    return 1
  fi
  green "Function publish-config OK"
  rm -f "${bodyfile}"
}

check_mqtt_config_retained() {
  blue "==> Check MQTT retained en ${TOPIC_CONFIG}"
  local out
  set +e
  out="$(mosquitto_sub -h "${BROKER_HOST}" -p "${BROKER_PORT}" \
    --capath "${BROKER_CAPATH}" \
    ${BROKER_USER:+-u "${BROKER_USER}"} \
    ${BROKER_PASS:+-P "${BROKER_PASS}"} \
    -t "${TOPIC_CONFIG}" -q 1 -C 1 -W 5 2>&1)"
  local rc=$?
  set -e
  if [[ $rc -ne 0 || -z "${out}" ]]; then
    red "No se recibió retained en 5s o error de conexión."
    echo "${out}"
    return 1
  fi
  echo "Mensaje:"
  echo "${out}"
  green "MQTT retained OK"
}

check_mqtt_data_stream() {
  blue "==> Check MQTT datos en ${TOPIC_DATA} (ventana 5s)"
  local out
  set +e
  out="$(mosquitto_sub -h "${BROKER_HOST}" -p "${BROKER_PORT}" \
    --capath "${BROKER_CAPATH}" \
    ${BROKER_USER:+-u "${BROKER_USER}"} \
    ${BROKER_PASS:+-P "${BROKER_PASS}"} \
    -t "${TOPIC_DATA}" -v -W 5 2>&1)"
  local rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    red "Error al suscribirse a datos:"
    echo "${out}"
    return 1
  fi
  if [[ -z "${out}" ]]; then
    yellow "No llegaron mensajes en 5s (puede ser normal si no hay lecturas en curso)."
  else
    echo "Muestras:"
    echo "${out}" | head -n 10
    green "MQTT datos OK"
  fi
}

# ========== Main ==========
need curl
need jq
need mosquitto_sub

echo "=== Variables ==="
echo "SITE_URL=${SITE_URL}"
echo "API_TENDENCIAS_URL=${API_TENDENCIAS_URL}"
echo "PUBLISH_FN_URL=${PUBLISH_FN_URL}"
echo "BROKER_HOST=${BROKER_HOST}:${BROKER_PORT}"
echo "GATEWAY_ID=${GATEWAY_ID}"
echo "TOPIC_CONFIG=${TOPIC_CONFIG}"
echo "TOPIC_DATA=${TOPIC_DATA}"
echo "================="

fail=0

check_frontend      || fail=1
check_api_tendencias || fail=1
check_function_publish || fail=1
check_mqtt_config_retained || fail=1
check_mqtt_data_stream || fail=1

if [[ $fail -eq 0 ]]; then
  green "✅ Todo OK: Frontend, API, Function y MQTT verificados."
else
  red "❌ Hay fallas. Revisá logs arriba y ajustá configuración."
fi
exit $fail
