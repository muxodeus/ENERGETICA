// mqtt2netlify.js
const mqtt   = require("mqtt");
const axios  = require("axios");

// 1) Configura tu HiveMQ Cloud
const GATEWAY_ID  = "RB751-CASA";
const BROKER_URL  = "mqtts://d84e0de763a04f6b832b86427fdd9d3d.s2.eu.hivemq.cloud:8883";
const USER        = "joserecinos";
const PASS        = "Recinos5";
const TOPIC       = "energia/#";

// 2) URL de tu Netlify Function
const NETLIFY_FN  = "https://analitica-energetica.netlify.app/.netlify/functions/ingest-mqtt";

const client = mqtt.connect(BROKER_URL, {
  clientId:    GATEWAY_ID,
  username:    USER,
  password:    PASS,
  rejectUnauthorized: true
});

client.on("connect", () => {
  console.log("▶ MQTT conectado, suscribiendo a", TOPIC);
  client.subscribe(TOPIC, { qos: 1 });
});

client.on("error", err => {
  console.error("❌ MQTT error:", err);
});

client.on("message", async (topic, msgBuf) => {
  const value = msgBuf.toString();
  await axios.post(NETLIFY_FN, {
    topic,
    value
  });
});
