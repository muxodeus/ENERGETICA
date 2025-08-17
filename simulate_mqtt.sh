#!/usr/bin/env bash
set -euo pipefail
BROKER="d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud"
PORT=8883
USER="${HIVEMQ_USER:-joserecinos}"
PASS="${HIVEMQ_PASS:-Recinos5}"
DEVICE="${1:-CTY-SYS-001}"
TOPIC="telemetry/${DEVICE}/data"
DUR="${2:-60}"
INT="${3:-2}"

if ! command -v mosquitto_pub >/dev/null 2>&1; then
  echo "Instala mosquitto-clients"; exit 1; fi

end=$((SECONDS + DUR))
while [ $SECONDS -lt $end ]; do
  ts=$(date -Iseconds)
  val=$(awk -v min=20 -v max=35 'BEGIN{srand(); printf "%.2f", min+rand()*(max-min)}')
  payload="{\"device\":\"$DEVICE\",\"ts\":\"$ts\",\"metrics\":{\"temp\":$val}}"
  mosquitto_pub -h "$BROKER" -p "$PORT" -u "$USER" -P "$PASS" \
    --capath /etc/ssl/certs -q 1 -t "$TOPIC" -m "$payload"
  sleep "$INT"
done
echo "Listo."

