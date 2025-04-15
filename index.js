// index.js
import express from "express";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();
const app = express();
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

// Endpoint para recibir nuevos decretos desde GPT u otra interfaz
app.post("/decretar", async (req, res) => {
  const {
    nombre,
    codigo,
    fecha,
    emisor,
    ejecutor,
    estado,
    fase,
    modulos,
    sello,
    efecto,
    notas,
    item
  } = req.body;

  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: nombre } }] },
        Ítem: { number: item },
        "Código del Decreto": { rich_text: [{ text: { content: codigo } }] },
        "Fecha de Emisión": { date: { start: fecha } },
        Emisor: { select: { name: emisor } },
        Ejecutor: { select: { name: ejecutor } },
        Estado: { select: { name: estado } },
        "Vinculado a Fase": { rich_text: [{ text: { content: fase } }] },
        "Módulos Activados": { multi_select: modulos.map(m => ({ name: m })) },
        "Frase de Sello Cuántico": { rich_text: [{ text: { content: sello } }] },
        "Efecto Principal": { rich_text: [{ text: { content: efecto } }] },
        "Notas Internas": { rich_text: [{ text: { content: notas } }] }
      }
    });

    res.status(200).send({ message: "Decreto ejecutado con éxito." });
  } catch (err) {
    console.error("❌ Error al crear decreto:", err);
    res.status(500).send({ error: "Error ejecutando el decreto." });
  }
});

// Endpoint raíz de prueba
app.get("/", (_, res) => {
  res.send("Dominus API está viva.");
});

// Endpoint para Webhook de Notion
app.post("/webhook", (req, res) => {
  const { verification_token } = req.body;
  console.log("🛰️ Webhook recibido desde Notion:", req.body);
  res.send(verification_token);
});

app.post("/webhook", express.text({ type: "*/*" }), (req, res) => {
  const verificationToken = req.headers["notion-verification-token"];

  if (verificationToken) {
    console.log("TOKEN DE VERIFICACIÓN RECIBIDO:", verificationToken);
    // Aquí puedes opcionalmente guardar o verificar el token si quieres que sea seguro
    res.status(200).send();
  } else {
    console.log("No se recibió token de verificación");
    res.status(400).send();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Dominus operando en puerto ${PORT}`));
// index.js (solo añade esto debajo de app.use)

app.post("/webhook", (req, res) => {
  const notionToken = req.headers["notion-webhook-challenge"];
  if (notionToken) {
    console.log("🔐 Token de verificación recibido:", notionToken);
    return res.status(200).send(notionToken); // RESPONDE con el token como texto plano
  }

  console.log("📡 Evento webhook recibido:", req.body);
  res.status(200).send("OK");
});

