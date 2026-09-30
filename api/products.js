"use strict";

const { getProducts } = require("../lib/store-products");
const { handleError, secureHeaders, sendJson } = require("../lib/vercel-core");

module.exports = async function productsHandler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Método não permitido." });
  }

  try {
    const catalog = await getProducts();
    secureHeaders(response, false);
    response.status(200).json({ products: catalog.products, revision: catalog.revision });
  } catch (error) {
    handleError(response, error);
  }
};
