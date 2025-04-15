// index.js
import express from "express";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();
const app = express();
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

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
    console.error(err);
    res.status(500).send({ error: "Error ejecutando el decreto." });
  }
});

app.get("/", (_, res) => {
  res.send("Dominus API está viva.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Dominus operando en puerto ${PORT}`));
