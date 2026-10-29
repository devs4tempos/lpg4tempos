"use strict";

const { audit, handleError, readJson, rejectWrongHost, requireCsrf, requireSession, sameOrigin, secureHeaders, sendJson } = require("../../lib/vercel-core");
const { getProducts, saveProducts } = require("../../lib/store-products");

const MAX_PRODUCTS = 500;
const MAX_CATEGORIES = 100;
const MAX_IMAGE_LENGTH = 900_000;
const MAX_CATALOG_BYTES = 8_000_000;

function text(value, maxLength) {
  const result = String(value ?? "").trim();
  return result.length <= maxLength ? result : result.slice(0, maxLength);
}

function isAllowedImage(value) {
  return value === "" || value.startsWith("data:image/") || value.startsWith("/") || value.startsWith("img/") || value.startsWith("https://") || value.startsWith("http://");
}

function normalizeCategories(value) {
  if (!Array.isArray(value) || value.length > MAX_CATEGORIES) return null;
  const seen = new Set();
  const categories = [];
  for (const item of value) {
    const category = text(item, 80);
    const key = category.toLocaleLowerCase("pt-BR");
    if (!category || seen.has(key)) return null;
    seen.add(key);
    categories.push(category);
  }
  return categories.sort((left, right) => left.localeCompare(right, "pt-BR"));
}

function normalizeProducts(value) {
  if (!Array.isArray(value) || value.length > MAX_PRODUCTS) return null;
  const ids = new Set();
  const products = value.map((item, index) => {
    if (!item || typeof item !== "object") return null;
    const id = text(item.id || `produto-${Date.now()}-${index}`, 160).replace(/[^a-zA-Z0-9_-]/g, "-");
    const name = text(item.name, 160);
    const category = text(item.category, 80);
    const description = text(item.description, 500);
    const icon = text(item.icon || "fa-gears", 80).replace(/[^a-zA-Z0-9 -]/g, "");
    const rawImage = String(item.image ?? "").trim();
    const image = rawImage;
    const price = Number(item.price);
    if (!id || ids.has(id) || !name || !category || !Number.isFinite(price) || price < 0 || price > 10_000_000 || rawImage.length > MAX_IMAGE_LENGTH || !isAllowedImage(image)) return null;
    ids.add(id);
    return { id, name, category, description, icon, image, price: Math.round(price * 100) / 100 };
  });
  return products.every(Boolean) ? products : null;
}

function normalizeProduct(value) {
  const products = normalizeProducts([value]);
  return products?.[0] || null;
}

function normalizeProductId(value) {
  return text(value, 160).replace(/[^a-zA-Z0-9_-]/g, "-");
}

module.exports = async function adminProductsHandler(request, response) {
  if (!["GET", "PUT"].includes(request.method)) {
    response.setHeader("Allow", "GET, PUT");
    return sendJson(response, 405, { error: "Método não permitido." });
  }
  if (rejectWrongHost(request, response) || !sameOrigin(request)) {
    if (!response.headersSent) sendJson(response, 403, { error: "Origem não autorizada." });
    return;
  }

  try {
    const session = await requireSession(request, response);
    if (!session) return;
    const catalog = await getProducts();
    if (request.method === "GET") {
      secureHeaders(response, true);
      return response.status(200).json({
        products: catalog.products,
        categories: catalog.categories,
        revision: catalog.revision,
        categoriesRevision: catalog.categoriesRevision
      });
    }
    if (!requireCsrf(request, response, session.session)) return;

    const body = readJson(request);
    const catalogPatch = body.product !== undefined || body.deleteProductId !== undefined;
    let products;

    if (catalogPatch) {
      if (body.product !== undefined && body.deleteProductId !== undefined) {
        return sendJson(response, 400, { error: "Envie apenas uma alteração de produto por vez." });
      }

      if (body.product !== undefined) {
        const product = normalizeProduct(body.product);
        if (!product) return sendJson(response, 400, { error: "Produto inválido." });
        const existingIndex = catalog.products.findIndex(item => item.id === product.id);
        if (existingIndex < 0 && catalog.products.length >= MAX_PRODUCTS) {
          return sendJson(response, 400, { error: "Limite de produtos atingido." });
        }
        products = existingIndex < 0
          ? [product, ...catalog.products]
          : catalog.products.map((item, index) => index === existingIndex ? product : item);
      } else {
        const deleteProductId = normalizeProductId(body.deleteProductId);
        if (!deleteProductId) return sendJson(response, 400, { error: "Produto inválido." });
        products = catalog.products.filter(item => item.id !== deleteProductId);
      }
    } else {
      // Mantém compatibilidade com clientes antigos que ainda enviem o catálogo completo.
      products = body.products === undefined ? catalog.products : normalizeProducts(body.products);
    }
    const categories = body.categories === undefined ? catalog.categories : normalizeCategories(body.categories);
    const productCategories = new Set(products?.map(product => product.category) || []);
    const missingProductCategory = categories && [...productCategories].some(category => !categories.includes(category));
    if (!products || !categories || missingProductCategory || Buffer.byteLength(JSON.stringify({ products, categories }), "utf8") > MAX_CATALOG_BYTES) {
      return sendJson(response, 400, { error: "Catálogo inválido ou grande demais." });
    }
    const saved = await saveProducts(
      products,
      String(body.revision || ""),
      categories,
      String(body.categoriesRevision || catalog.categoriesRevision || "")
    );
    if (saved.status === "conflict") {
      return sendJson(response, 409, {
        error: "O catálogo mudou em outra sessão. Recarregue antes de salvar.",
        revision: saved.revision,
        categoriesRevision: saved.categoriesRevision
      });
    }
    await audit("products_saved", request, { count: products.length }).catch(() => {});
    secureHeaders(response, true);
    response.status(200).json({
      saved: true,
      products,
      categories: saved.categories,
      revision: saved.revision,
      categoriesRevision: saved.categoriesRevision
    });
  } catch (error) {
    handleError(response, error);
  }
};
