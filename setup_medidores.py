import json, ssl, time, certifi
import paho.mqtt.client as mqtt

# Parámetros de conexión
MQTT_HOST = "d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "joserecinos"
MQTT_PASS = "Recinos5"
MQTT_TOPIC = "config/medidores"

# 🛠 Configuración del medidor
configuracion = {
    "gateway_id": "RB751-CASA",   # ← debe coincidir con GATEWAY_ID remoto
    "id": 12,
    "nombre": "BOMBA_AGUA",
    "host": "192.168.1.205",         # IP del medidor Modbus TCP
    "unit_id": 1,
    "lecturas": {
        "voltaje_A": 1010,
        "corriente_A": 1000,
        "potencia_total": 1034,
        "energia_total": 2606
    }
}

# 🚀 Publicar configuración
def enviar_config():
    client = mqtt.Client()
    client.username_pw_set(MQTT_USER, MQTT_PASS)
    # carga CA bundle de certifi para TLS
    client.tls_set(ca_certs=certifi.where())
    client.tls_insecure_set(False)
    client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)

    client.loop_start()
    payload = json.dumps(configuracion)
    client.publish(MQTT_TOPIC, payload, qos=1)
    print(f"📤 Config enviada a HiveMQ: {payload}")
    time.sleep(2)
    client.loop_stop()
    client.disconnect()

if __name__ == "__main__":
    enviar_config()