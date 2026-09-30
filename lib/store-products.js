"use strict";

const path = require("node:path");
const { promises: fs } = require("node:fs");
const { redisCommand, sha256, unwrap } = require("./vercel-core");

const ROOT = path.resolve(__dirname, "..");
const KEY_PREFIX = process.env.ADMIN_STORAGE_PREFIX || "m4t";
const PRODUCTS_KEY = `${KEY_PREFIX}:store:products`;
const REVISION_KEY = `${KEY_PREFIX}:store:products:revision`;
const BASE_PRODUCTS_PATH = path.join(ROOT, "loja", "products.json");

async function readBaseProducts() {
  const content = await fs.readFile(BASE_PRODUCTS_PATH, "utf8");
  const products = JSON.parse(content);
  if (!Array.isArray(products)) throw new Error("Catálogo base inválido.");
  return products;
}

async function getProducts() {
  const baseProducts = await readBaseProducts();
  const stored = unwrap(await redisCommand(["GET", PRODUCTS_KEY], { required: false }));
  if (typeof stored !== "string") {
    return { products: baseProducts, revision: sha256(JSON.stringify(baseProducts)), source: "published" };
  }

  try {
    const products = JSON.parse(stored);
    if (!Array.isArray(products)) throw new Error("Catálogo persistido inválido.");
    const revision = unwrap(await redisCommand(["GET", REVISION_KEY], { required: false }));
    return { products, revision: typeof revision === "string" ? revision : sha256(stored), source: "admin" };
  } catch (error) {
    console.error("Catálogo persistido inválido; usando catálogo publicado.", error.message);
    return { products: baseProducts, revision: sha256(JSON.stringify(baseProducts)), source: "published" };
  }
}

async function saveProducts(products, expectedRevision) {
  const serialized = JSON.stringify(products);
  const current = await getProducts();
  const nextRevision = sha256(serialized);
  const script = [
    "local current = redis.call('GET', KEYS[2])",
    "if not current then current = ARGV[1] end",
    "if current ~= ARGV[2] then return {0, current} end",
    "redis.call('SET', KEYS[1], ARGV[3])",
    "redis.call('SET', KEYS[2], ARGV[4])",
    "return {1, ARGV[4]}"
  ].join("\n");
  const result = unwrap(await redisCommand([
    "EVAL", script, 2, PRODUCTS_KEY, REVISION_KEY,
    current.revision, expectedRevision, serialized, nextRevision
  ]));
  if (!Array.isArray(result) || Number(result[0]) !== 1) {
    return { status: "conflict", revision: Array.isArray(result) ? result[1] : current.revision };
  }
  return { status: "saved", revision: nextRevision };
}

module.exports = { getProducts, saveProducts };
