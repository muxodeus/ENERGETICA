#!/usr/bin/env bash
set -euo pipefail

# ===== Configuración base =====
BASE_DIR="/home/jose/iot_publisher"
LOG_FILE="$BASE_DIR/logs/watcher.log"
CONFIG_DIR="$BASE_DIR/config"
CONFIG_FILE="$CONFIG_DIR/${GATEWAY_ID}.json"

mkdir -p "$CONFIG_DIR" "$(dirname "$LOG_FILE")"

log() {
  echo "$(date '+%F %T') $*" | tee -a "$LOG_FILE"
}

# Validar existencia y formato del archivo de configuración
if [ ! -f "$CONFIG_FILE" ]; then
  log "❌ Archivo de configuración no encontrado: $CONFIG_FILE"
  exit 1
fi

if ! jq empty "$CONFIG_FILE" >/dev/null 2>&1; then
  log "❌ Archivo de configuración inválido (no es JSON): $CONFIG_FILE"
  exit 1
fi

# Extraer parámetros del JSON
get_config_value() {
  jq -r ".$1" "$CONFIG_FILE"
}

UPDATE_INTERVAL=$(get_config_value intervalo_segundos)
BROKER=$(get_config_value broker_host)
PORT=$(get_config_value broker_port)
TOPIC_DATA="energia/$GATEWAY_ID"
TOPIC_STATUS="status/$GATEWAY_ID"

# MQTT credentials (del entorno)
MQTT_USER="${MQTT_USER:-}"
MQTT_PASS="${MQTT_PASS:-}"
CA_FILE="${CA_FILE:-/etc/ssl/certs/ca-certificates.crt}"

log "⚙️ Configuración cargada: broker=$BROKER:$PORT intervalo=${UPDATE_INTERVAL}s"

# Función para publicar datos reales
publish_real_data() {
  local payload="{\"timestamp\":\"$(date -Iseconds)\",\"valor\":42}"
  mosquitto_pub -h "$BROKER" -p "$PORT" \
    --cafile "$CA_FILE" -u "$MQTT_USER" -P "$MQTT_PASS" \
    -t "$TOPIC_DATA" -m "$payload" && log "📤 Publicado: $payload"
}

# Función para publicar heartbeat
publish_heartbeat() {
  local payload="{\"gateway_id\":\"$GATEWAY_ID\",\"timestamp\":\"$(date -Iseconds)\",\"status\":\"alive\"}"
  mosquitto_pub -h "$BROKER" -p "$PORT" \
    --cafile "$CA_FILE" -u "$MQTT_USER" -P "$MQTT_PASS" \
    -t "$TOPIC_STATUS" -m "$payload" && log "💓 Heartbeat enviado: $payload"
}

# Bucle principal
COUNTER=0
while true; do
  publish_real_data
  ((COUNTER++))
  if (( COUNTER % 5 == 0 )); then
    publish_heartbeat
  fi
  sleep "$UPDATE_INTERVAL"
done
