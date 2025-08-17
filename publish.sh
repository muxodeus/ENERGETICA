#!/usr/bin/env bash
set -euo pipefail

# ===== Config =====
BASE_DIR="$HOME/iot_publisher"
BIN_DIR="$BASE_DIR/bin"
CONFIG_DIR="$BASE_DIR/config"
LOG_DIR="$BASE_DIR/logs"
LOG_FILE="$LOG_DIR/publish.log"

# Identidad del gateway
GATEWAY_ID="RB751-CASA"

# MQTT (HiveMQ Cloud)
BROKER="d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud"
PORT=8883
USER="joserecinos"
PASS="Recinos5"
CA_FILE="/etc/ssl/certs/ca-certificates.crt"

TOPIC_CONFIG="config/$GATEWAY_ID"
TOPIC_ACK="config_ack/$GATEWAY_ID"
ACK_TIMEOUT=10  # segundos

CONFIG_FILE="$CONFIG_DIR/$GATEWAY_ID.json"

mkdir -p "$CONFIG_DIR" "$LOG_DIR"

log() { echo "$(date '+%F %T') $*" | tee -a "$LOG_FILE"; }

publish_mqtt() {
  local topic="$1" payload="$2"
  mosquitto_pub -h "$BROKER" -p "$PORT" \
    --cafile "$CA_FILE" -u "$USER" -P "$PASS" \
    -t "$topic" -m "$payload"
}

# ===== 1) Descargar config solo si NO existe =====
if [[ ! -f "$CONFIG_FILE" ]]; then
  log "⚠ No existe config local: $CONFIG_FILE. Intentando descargar..."
  if ! "$BIN_DIR/fetch_config.sh" "$GATEWAY_ID"; then
    log "❌ No se pudo descargar la config. Abortando."
    exit 1
  fi
  [[ -f "$CONFIG_FILE" ]] || { log "❌ Sigue sin existir $CONFIG_FILE"; exit 1; }
fi

# ===== 2) Publicar config desde disco =====
log "📤 Publicando config desde $CONFIG_FILE a $TOPIC_CONFIG"
publish_mqtt "$TOPIC_CONFIG" "$(cat "$CONFIG_FILE")"

# ===== 3) ACK watch =====
log "⏳ Esperando ACK en $TOPIC_ACK ($ACK_TIMEOUT s)..."
ACK_MSG=$(mosquitto_sub -h "$BROKER" -p "$PORT" \
  --cafile "$CA_FILE" -u "$USER" -P "$PASS" \
  -t "$TOPIC_ACK" -C 1 -W "$ACK_TIMEOUT" 2>/dev/null || true)

if [[ -n "$ACK_MSG" ]]; then
  log "✅ ACK recibido: $ACK_MSG"
else
  log "❌ No se recibió ACK en $ACK_TIMEOUT s"
fi
