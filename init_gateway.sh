#!/usr/bin/env bash
set -euo pipefail

# ===== Parámetros =====
GATEWAY_ID="${1:-}"
BROKER="${2:-d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud}"
PORT="${3:-8883}"
MQTT_USER="${4:-joserecinos}"
MQTT_PASS="${5:-Recinos5}"
REMOTE_HOST="${6:-192.168.86.25}"
REMOTE_USER="${7:-jose}"

if [[ -z "$GATEWAY_ID" ]]; then
  echo "❌ Uso: $0 <GATEWAY_ID> [broker] [port] [mqtt_user] [mqtt_pass] [remote_host] [remote_user]"
  exit 1
fi

BASE_DIR="/home/$REMOTE_USER/iot_publisher"
ENV_FILE=".env.$GATEWAY_ID"
UNIT_FILE="iot-watcher@$GATEWAY_ID.service"

# ===== Crear archivo .env.<ID> =====
cat > "$ENV_FILE" <<EOF
GATEWAY_ID="$GATEWAY_ID"
MQTT_USER="$MQTT_USER"
MQTT_PASS="$MQTT_PASS"
BROKER="$BROKER"
PORT=$PORT
CA_FILE="/etc/ssl/certs/ca-certificates.crt"
BASE_DIR="$BASE_DIR"
EOF

echo "✅ Generado: $ENV_FILE"

# ===== Crear archivo systemd unit personalizado =====
cat > "$UNIT_FILE" <<EOF
[Unit]
Description=IoT Watcher para $GATEWAY_ID
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$REMOTE_USER
WorkingDirectory=$BASE_DIR
EnvironmentFile=$BASE_DIR/$ENV_FILE
ExecStart=$BASE_DIR/bin/watcher.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Generado: $UNIT_FILE"

# ===== Copiar archivos al host remoto =====
scp "$ENV_FILE" "$REMOTE_USER@$REMOTE_HOST:$BASE_DIR/$ENV_FILE"
scp "$UNIT_FILE" "$REMOTE_USER@$REMOTE_HOST:/etc/systemd/system/$UNIT_FILE"

# ===== Activar servicio en el host remoto =====
ssh "$REMOTE_USER@$REMOTE_HOST" <<EOF
sudo systemctl daemon-reload
sudo systemctl enable --now iot-watcher@$GATEWAY_ID
EOF

echo "🚀 Gateway $GATEWAY_ID desplegado y activado en $REMOTE_HOST"

# ===== Limpiar archivos locales =====
rm "$ENV_FILE" "$UNIT_FILE"
