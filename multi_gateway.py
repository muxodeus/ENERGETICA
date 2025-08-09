#!/usr/bin/env python3
import json, time, ssl, logging, struct
from collections import deque
from pyModbusTCP.client import ModbusClient
import paho.mqtt.client as mqtt
import certifi

# ── Parámetros del Gateway ─────────────────────────────
GATEWAY_ID   = "RB751-CASA"
CLOUD_HOST   = "d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud"
CLOUD_PORT   = 8883
CLOUD_USER   = "joserecinos"
CLOUD_PASS   = "Recinos5"
TOPIC_CFG    = "config/medidores"
TOPIC_PREFIX = "energia"

# ── Logging ─────────────────────────────────────────────
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s: %(message)s")
log = logging.getLogger("multi_gateway")

# ── Estado dinámico ─────────────────────────────────────
medidores   = {}
mqtt_buffer = deque(maxlen=500)

# ── Callbacks MQTT ──────────────────────────────────────
def on_connect(client, userdata, flags, rc):
    log.info(f"🔌 MQTT conectado rc={rc}")
    client.subscribe(TOPIC_CFG)

def on_message(client, userdata, msg):
    try:
        cfg = json.loads(msg.payload)
        if cfg.get("gateway_id") != GATEWAY_ID:
            return
        medidores[cfg["id"]] = cfg
        log.info(f"🆕 Medidor agregado: {cfg['nombre']} (ID {cfg['id']})")
    except Exception as e:
        log.warning(f"⚠️ Error config: {e}")

# ── Cliente MQTT ────────────────────────────────────────
mqtt_client = mqtt.Client(client_id=GATEWAY_ID, clean_session=False)
#mqtt_client.username_pw_set(CLOUD_USER, CLOUD_PASS)
#mqtt_client.tls_set(ca_certs=certifi.where())
#mqtt_client.tls_insecure_set(False)
mqtt_client.on_connect    = on_connect
mqtt_client.on_message    = on_message
mqtt_client.on_disconnect = lambda c,u,rc: log.warning(f"⚠️ MQTT desconectado rc={rc}")
mqtt_client.reconnect_delay_set(min_delay=1, max_delay=120)
mqtt_client.connect("127.0.0.1", 1883, keepalive=60)
mqtt_client.loop_start()

# ── Publicación con buffer ──────────────────────────────
def publish(topic, payload):
    for _ in range(len(mqtt_buffer)):
        msg = mqtt_buffer[0]
        if mqtt_client.publish(msg["topic"], msg["payload"], qos=1).rc == 0:
            mqtt_buffer.popleft()
        else:
            break
    res = mqtt_client.publish(topic, payload, qos=1)
    if res.rc != 0:
        mqtt_buffer.append({"topic": topic, "payload": payload})
        log.warning(f"⚠️ MQTT buffer size={len(mqtt_buffer)}")
    else:
        log.info(f"📤 {topic} → {payload}")

# ── Bucle principal ─────────────────────────────────────
def ciclo_medidores():
    while True:
        for cfg in medidores.values():
            m = ModbusClient(host=cfg["host"], port=502, auto_open=True)
            export PYTHONPATH=/root/vendor
python3 /root/modbus_test.py

            if not m.is_open():
                log.warning(f"❌ No conecta {cfg['nombre']}")
                continue

            datos = {
                "dispositivo": cfg["nombre"],
                "id":          cfg["id"],
                "timestamp":   int(time.time())
            }

            for key, addr in cfg["lecturas"].items():
                regs = m.read_holding_registers(addr, 2)
                if regs:
                    bts = struct.pack(">HH", *regs)
                    datos[key] = round(struct.unpack(">f", bts)[0], 3)

            m.close()
            topic   = f"{TOPIC_PREFIX}/{cfg['nombre']}"
            payload = json.dumps(datos)
            publish(topic, payload)
        time.sleep(5)

# ── Lanzamiento ────────────────────────────────────────
if __name__ == "__main__":
    log.info(f"🚀 Iniciando gateway {GATEWAY_ID}")
    ciclo_medidores()
