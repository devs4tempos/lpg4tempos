"use strict";

const { saveProductImage } = require("../../lib/store-products");
const { handleError, readJson, rejectWrongHost, requireCsrf, requireSession, sameOrigin, secureHeaders, sendJson } = require("../../lib/vercel-core");

const MAX_IMAGE_LENGTH = 900_000;
const IMAGE_DATA_PATTERN = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=]+)$/i;

function normalizeProductId(value) {
  return String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 160);
}

module.exports = async function adminImagesHandler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Método não permitido." });
  }
  if (rejectWrongHost(request, response) || !sameOrigin(request)) {
    if (!response.headersSent) sendJson(response, 403, { error: "Origem não autorizada." });
    return;
  }

  try {
    const session = await requireSession(request, response);
    if (!session) return;
    if (!requireCsrf(request, response, session.session)) return;

    const body = readJson(request);
    const productId = normalizeProductId(body.productId);
    const image = String(body.image ?? "").trim();
    const match = IMAGE_DATA_PATTERN.exec(image);
    if (!productId || !match || image.length > MAX_IMAGE_LENGTH) {
      return sendJson(response, 400, { error: "Imagem inválida ou grande demais." });
    }

    const imagePath = await saveProductImage(productId, image);
    secureHeaders(response, true);
    return response.status(200).json({ saved: true, path: imagePath });
  } catch (error) {
    handleError(response, error);
  }
};
