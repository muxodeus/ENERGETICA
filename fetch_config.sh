#!/usr/bin/env bash
set -uo pipefail

BASE_DIR="$HOME/iot_publisher"
CONFIG_DIR="$BASE_DIR/config"
LOG_FILE="$BASE_DIR/logs/fetch_config.log"
ENV_FILE="$BASE_DIR/.env"

mkdir -p "$CONFIG_DIR" "$(dirname "$LOG_FILE")"

# Cargar variables opcionales
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

# SITE_URL por defecto
SITE_URL="${SITE_URL:-https://analitica-energetica.netlify.app}"

# Gateways a procesar:
# - Si pasas argumentos: se usan como lista de gateways
# - Si no: usa $GATEWAYS del .env o default "RB751-CASA"
if (( "$#" > 0 )); then
  GWS=("$@")
else
  GATEWAYS="${GATEWAYS:-RB751-CASA}"   # default seguro aunque set -u
  # dividir por espacios
  read -r -a GWS <<< "$GATEWAYS"
fi

ts() { date '+%F %T'; }
log() { echo "$(ts) $*" >> "$LOG_FILE"; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || { log "❌ Falta comando: $1"; exit 0; }; }
need_cmd curl
need_cmd jq

# Función para obtener el token por gateway:
# 1) Si existe TOKEN_<GATEWAY> en env, usarlo
# 2) Si existe TOKEN global (y solo 1 gateway), usarlo
# 3) Si no hay token, se hace request sin Authorization
get_token_for() {
  local gw="$1"
  local key="TOKEN_$(echo "$gw" | tr '[:lower:]-' '[:upper:]_')"
  # shellcheck disable=SC2154
  if [[ -n "${!key-}" ]]; then
    echo "${!key}"
  elif [[ -n "${TOKEN-}" ]] && (( ${#GWS[@]} == 1 )); then
    echo "$TOKEN"
  else
    echo ""
  fi
}

rc=0
for gw in "${GWS[@]}"; do
  URL="${SITE_URL}/.netlify/functions/get-config?gateway=${gw}"
  TMP="${CONFIG_DIR}/${gw}.json.tmp"
  DST="${CONFIG_DIR}/${gw}.json"
  TOKEN=$(get_token_for "$gw")

  log "→ Descargando config de ${gw} desde ${URL}"

  if [[ -n "$TOKEN" ]]; then
    http_code=$(curl -sS -w '%{http_code}' \
      -H "Authorization: Bearer ${TOKEN}" \
      -o "$TMP" "$URL" || echo 000)
  else
    http_code=$(curl -sS -w '%{http_code}' \
      -o "$TMP" "$URL" || echo 000)
  fi

  if [[ "$http_code" != "200" ]]; then
    log "❌ HTTP ${http_code} al pedir config de ${gw}"
    rm -f "$TMP"
    rc=1
    continue
  fi

  if ! jq empty "$TMP" 2>/dev/null; then
    head -c 200 "$TMP" | tr -d '\r\n' | sed 's/[[:cntrl:]]//g' >> "$LOG_FILE"
    log "❌ Respuesta no es JSON válido para ${gw}"
    rm -f "$TMP"
    rc=1
    continue
  fi

  mv -f "$TMP" "$DST"
  log "✅ Config actualizada: $DST"
done

# Para que el timer no marque fallo aunque haya 404 intermitentes:
exit 0
