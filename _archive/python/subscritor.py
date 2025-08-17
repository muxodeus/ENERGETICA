import ssl
import json
from paho.mqtt import client as mqtt

BROKER = "d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud"
PORT   = 8883
TOPIC  = "energia/BOMBA_AGUA"
USER   = "joserecinos"
PASS   = "Recinos5"

def on_connect(client, userdata, flags, rc):
    print("🔗 Conectado con rc=", rc)
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    print(msg.topic, "→", msg.payload.decode())

client = mqtt.Client(transport="tcp")
client.username_pw_set(USER, PASS)
# Indica a paho-mqtt que no valide la cadena de CA (solo en desarrollo)
client.tls_set(cert_reqs=ssl.CERT_NONE)
client.tls_insecure_set(True)

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT)
client.loop_forever()
