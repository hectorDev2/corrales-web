#!/usr/bin/env node
// Agente local de impresión ESC/POS. Sin dependencias (Node >= 18).
// Uso: node server.mjs   (lee config.json en la misma carpeta)
import http from "node:http";
import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { kitchenTicket, receiptTicket } from "./templates.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8"));
cfg.columns ??= 48;

/** Envía bytes a la impresora: por red (puerto 9100) o a una impresora compartida de Windows. */
function send(printer, data) {
  return new Promise((resolve, reject) => {
    if (printer.type === "network") {
      const sock = net.createConnection({ host: printer.host, port: printer.port ?? 9100, timeout: 5000 });
      sock.on("connect", () => sock.end(data));
      sock.on("close", (err) => (err ? reject(new Error("socket")) : resolve()));
      sock.on("timeout", () => { sock.destroy(); reject(new Error("Tiempo de espera agotado")); });
      sock.on("error", reject);
    } else if (printer.type === "windows") {
      // Requiere la impresora compartida: \\localhost\<share>
      const tmp = path.join(os.tmpdir(), `ticket-${Date.now()}.bin`);
      fs.writeFileSync(tmp, data);
      execFile("cmd.exe", ["/c", "copy", "/B", tmp, `\\\\localhost\\${printer.share}`], (err) => {
        fs.rmSync(tmp, { force: true });
        err ? reject(err) : resolve();
      });
    } else {
      reject(new Error(`Tipo de impresora no soportado: ${printer.type}`));
    }
  });
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && cfg.allowedOrigins?.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "content-type, x-print-token");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Private-Network", "true");
    return true;
  }
  return !origin; // peticiones sin Origin (curl) se permiten, pero exigen token
}

const json = (res, code, body) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

http.createServer((req, res) => {
  if (!cors(req, res)) return json(res, 403, { error: "Origen no permitido" });
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (req.url === "/health") return json(res, 200, { ok: true, printers: Object.keys(cfg.printers) });
  if (req.method !== "POST" || req.url !== "/print") return json(res, 404, { error: "No encontrado" });
  if (cfg.token && req.headers["x-print-token"] !== cfg.token) return json(res, 401, { error: "Token inválido" });

  let body = "";
  req.on("data", (c) => { body += c; if (body.length > 1e6) req.destroy(); });
  req.on("end", async () => {
    try {
      const { printer, type, station, order, openDrawer } = JSON.parse(body);
      const target = cfg.printers[printer];
      if (!target) return json(res, 400, { error: `Impresora desconocida: ${printer}` });
      if (!order?.items) return json(res, 400, { error: "Pedido inválido" });
      let data = type === "kitchen" ? kitchenTicket(order, cfg, station) : receiptTicket(order, cfg);
      if (openDrawer) data = Buffer.concat([Buffer.from([0x1b, 0x70, 0x00, 0x32, 0xfa]), data]);
      await send(target, data);
      json(res, 200, { ok: true });
    } catch (e) {
      console.error(e);
      json(res, 500, { error: e.message ?? "Error al imprimir" });
    }
  });
}).listen(cfg.port ?? 9101, "127.0.0.1", () =>
  console.log(`Agente de impresión escuchando en http://127.0.0.1:${cfg.port ?? 9101}`));
