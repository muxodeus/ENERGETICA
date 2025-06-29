#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
sys.path.insert(0, "/root/vendor")

import time
import json
import ssl
import logging

from pymodbus.client.sync   import ModbusTcpClient
from pymodbus.payload       import BinaryPayloadDecoder
from pymodbus.constants     import Endian
import paho.mqtt.client as mqtt

# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s %(levelname)s:%(name)s: %(message)s",
    level=logging.DEBUG
)
log = logging.getLogger("modbus_mqtt_gateway")

# ─── Configuración Modbus ───────────────────────────────────────────────────
MODBUS_HOST    = "192.168.1.205"
MODBUS_PORT    = 502
MODBUS_UNIT_ID = 1

# ─── Configuración MQTT ─────────────────────────────────────────────────────
MQTT_BROKER = "d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud"
MQTT_PORT   = 8883
MQTT_TOPIC  = "energia/BOMBA_AGUA"
MQTT_USER   = "joserecinos"
MQTT_PASS   = "Recinos5"

# ─── Callbacks MQTT ─────────────────────────────────────────────────────────
def on_connect(client, userdata, flags, rc):
    log.info("MQTT conectado rc=%s", rc)
    client.subscribe(MQTT_TOPIC, qos=1)

def on_publish(client, userdata, mid):
    log.debug("Publicación confirmada mid=%s", mid)

def on_disconnect(client, userdata, rc):
    log.warning("MQTT desconectado rc=%s", rc)

# ─── Cliente MQTT ───────────────────────────────────────────────────────────
mqtt_client = mqtt.Client()
mqtt_client.username_pw_set(MQTT_USER, MQTT_PASS)
mqtt_client.tls_set(cert_reqs=ssl.CERT_REQUIRED)
mqtt_client.on_connect    = on_connect
mqtt_client.on_publish    = on_publish
mqtt_client.on_disconnect = on_disconnect

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    mqtt_client.loop_start()
    log.info("Conectando a HiveMQ Cloud %s:%s", MQTT_BROKER, MQTT_PORT)
except Exception as e:
    log.error("Error conectando MQTT: %s", e)
    sys.exit(1)

# ─── Cliente Modbus ──────────────────────────────────────────────────────────
modbus_client = ModbusTcpClient(MODBUS_HOST, port=MODBUS_PORT)
if not modbus_client.connect():
    log.error("Error conectando Modbus en %s", MODBUS_HOST)
    sys.exit(1)
log.info("Conectado al medidor Modbus en %s", MODBUS_HOST)

def leer_float32(address):
    result = modbus_client.read_holding_registers(address, 2, unit=MODBUS_UNIT_ID)
    if result.isError():
        log.error("Error Modbus en %s: %s", address, result)
        return None
    decoder = BinaryPayloadDecoder.fromRegisters(
        result.registers,
        byteorder=Endian.Big,
        wordorder=Endian.Big
    )
    valor = round(decoder.decode_32bit_float(), 3)
    log.debug("Leído address %s → %s", address, valor)
    return valor

def obtener_datos():
    v = leer_float32(1010)
    c = leer_float32(1000)
    if v is None or c is None:
        return None
    return {
        "dispositivo":  "BOMBA_AGUA",
        "voltaje_A":    v,
        "corriente_A":  c,
        "timestamp":    int(time.time())
    }

def publicar_datos(datos):
    payload = json.dumps(datos)
    res = mqtt_client.publish(MQTT_TOPIC, payload, qos=1)
    log.info("Publish rc=%s mid=%s payload=%s", res.rc, res.mid, payload)

# ─── Main ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    try:
        log.info("Iniciando bucle cada 5s")
        # Mensaje de prueba
        test = {
            "dispositivo": "BOMBA_AGUA",
            "voltaje_A":   123.4,
            "corriente_A": 5.6,
            "timestamp":   int(time.time())
        }
        log.info("Publicando test: %s", test)
        publicar_datos(test)

        while True:
            datos = obtener_datos()
            if datos is None:
                log.warning("Sin datos, omito publish")
            else:
                publicar_datos(datos)
            time.sleep(5)

    except KeyboardInterrupt:
        log.info("Detenido por teclado")
    finally:
        mqtt_client