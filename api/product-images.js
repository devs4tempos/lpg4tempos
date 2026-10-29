"use strict";

const { getProductImage } = require("../lib/store-products");
const { handleError, secureHeaders, sendJson } = require("../lib/vercel-core");

function normalizeFileName(value) {
  let fileName = String(value ?? "");
  try { fileName = decodeURIComponent(fileName); } catch { return null; }
  return /^[a-zA-Z0-9_-]{1,220}\.jpg$/.test(fileName) ? fileName : null;
}

module.exports = async function productImagesHandler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Método não permitido." });
  }

  try {
    const fileName = normalizeFileName(request.query?.name);
    if (!fileName) return sendJson(response, 404, { error: "Imagem não encontrada." });
    const image = await getProductImage(fileName);
    const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=]+)$/i.exec(String(image || ""));
    if (!match) return sendJson(response, 404, { error: "Imagem não encontrada." });

    const buffer = Buffer.from(match[2], "base64");
    secureHeaders(response, false);
    response.setHeader("Content-Type", match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1]);
    response.setHeader("Content-Length", String(buffer.length));
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return response.status(200).end(buffer);
  } catch (error) {
    handleError(response, error);
  }
};
