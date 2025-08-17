// netlify/functions/heartbeat.js
const fs = require("fs");
const path = require("path");

module.exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { gateway_id, timestamp, status } = data;

    if (!gateway_id || !timestamp || !status) {
      return { statusCode: 400, body: "Missing required fields" };
    }

    // Carpeta donde guardaremos los estados
    const dir = path.join(__dirname, "../../data");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Archivo por gateway
    const filePath = path.join(dir, `status-${gateway_id}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ timestamp, status }, null, 2));

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    return { statusCode: 400, body: "Invalid JSON" };
  }
};

