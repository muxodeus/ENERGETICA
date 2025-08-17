const mqtt = require("mqtt");
const fs = require("fs");
const { exec } = require("child_process");
const ModbusRTU = require("modbus-serial");
const { Client } = require("pg");

// 🌐 Configuración
const GATEWAY_ID = "RB751-CASA";
const CONFIG_TOPIC = `config/${GATEWAY_ID}`;
const MQTT_BROKER = "mqtt://broker.hivemq.com";
const DB_URL = process.env.TIGER_CLOUD_URL;

let config = {};
let modbusClient = new ModbusRTU();
let pgClient;

// 🧠 Cargar respaldo local si existe
if (fs.existsSync("config.json")) {
  config = JSON.parse(fs.readFileSync("config.json"));
}

// 📡 Conexión MQTT
const mqttClient = mqtt.connect(MQTT_BROKER);
mqttClient.on("connect", () => {
  console.log("✅ Conectado a HiveMQ");
  mqttClient.subscribe(CONFIG_TOPIC);
});

// 📥 Recibir configuración desde la nube
mqttClient.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    if (payload.tipo === "configuracion") {
      config = payload;
      fs.writeFileSync("config.json", JSON.stringify(config));
      console.log("🧾 Configuración actualizada");
      await iniciarModbus();
    }
    if (payload.tipo === "comando") {
      ejecutarComando(payload.comando);
    }
  } catch (err) {
    console.error("❌ Error al procesar mensaje:", err.message);
  }
});

// 🔧 Ejecutar comandos remotos
function ejecutarComando(cmd) {
  if (cmd === "reiniciar_modbus") iniciarModbus();
  if (cmd === "modo_test") simularLectura();
  // Agregá más comandos según tu lógica
}

// 🔌 Iniciar conexión Modbus
async function iniciarModbus() {
  try {
    await modbusClient.connectTCP(config.ip, { port: 502 });
    modbusClient.setID(config.direccion_modbus);
    console.log("🔌 Conectado a medidor Modbus");
    iniciarLectura();
  } catch (err) {
    console.error("❌ Error Modbus:", err.message);
  }
}

// 📊 Lectura periódica
function iniciarLectura() {
  setInterval(async () => {
    try {
      const lectura = await modbusClient.readHoldingRegisters(0, 10); // ejemplo
      const payload = {
        instante: new Date().toISOString(),
        tension_L1: lectura.data[0],
        corriente_L1: lectura.data[1],
        potencia_activa_total: lectura.data[2],
        fp_total: lectura.data[3]
      };
      mqttClient.publish(`medidores/${GATEWAY_ID}/${config.medidor_id}/lecturas`, JSON.stringify(payload));
      await guardarEnTigerCloud(payload);
    } catch (err) {
      console.error("❌ Error en lectura:", err.message);
    }
  }, 60000); // cada minuto
}

// 🐘 Guardar en TigerCloud
async function guardarEnTigerCloud(payload) {
  try {
    if (!pgClient) {
      pgClient = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
      await pgClient.connect();
    }
    await pgClient.query(
      `INSERT INTO lecturas (medidor_id, instante, tension_L1, corriente_L1, potencia_activa_total, fp_total)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [config.medidor_id, payload.instante, payload.tension_L1, payload.corriente_L1, payload.potencia_activa_total, payload.fp_total]
    );
  } catch (err) {
    console.error("❌ Error al guardar en TigerCloud:", err.message);
  }
}
