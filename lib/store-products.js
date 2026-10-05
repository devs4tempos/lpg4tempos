"use strict";

const path = require("node:path");
const { promises: fs } = require("node:fs");
const { redisCommand, sha256, unwrap } = require("./vercel-core");

const ROOT = path.resolve(__dirname, "..");
const KEY_PREFIX = process.env.ADMIN_STORAGE_PREFIX || "m4t";
const PRODUCTS_KEY = `${KEY_PREFIX}:store:products`;
const REVISION_KEY = `${KEY_PREFIX}:store:products:revision`;
const CATEGORIES_KEY = `${KEY_PREFIX}:store:categories`;
const CATEGORIES_REVISION_KEY = `${KEY_PREFIX}:store:categories:revision`;
const BASE_PRODUCTS_PATH = path.join(ROOT, "loja", "products.json");

async function readBaseProducts() {
  const content = await fs.readFile(BASE_PRODUCTS_PATH, "utf8");
  const products = JSON.parse(content);
  if (!Array.isArray(products)) throw new Error("Catálogo base inválido.");
  return products;
}

function uniqueCategories(values) {
  const seen = new Set();
  return values
    .map(value => String(value ?? "").trim())
    .filter(value => {
      const key = value.toLocaleLowerCase("pt-BR");
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) => left.localeCompare(right, "pt-BR"));
}

function categoriesFromProducts(products) {
  return uniqueCategories(products.map(product => product?.category));
}

async function getProducts() {
  const baseProducts = await readBaseProducts();
  const baseCategories = categoriesFromProducts(baseProducts);
  const stored = unwrap(await redisCommand(["GET", PRODUCTS_KEY], { required: false }));
  const storedCategories = unwrap(await redisCommand(["GET", CATEGORIES_KEY], { required: false }));

  const readCategories = fallback => {
    if (typeof storedCategories !== "string") return fallback;
    try {
      const parsed = JSON.parse(storedCategories);
      return Array.isArray(parsed) ? uniqueCategories(parsed) : fallback;
    } catch {
      return fallback;
    }
  };

  if (typeof stored !== "string") {
    const categories = readCategories(baseCategories);
    const categoriesRevision = sha256(JSON.stringify(categories));
    return {
      products: baseProducts,
      revision: sha256(JSON.stringify(baseProducts)),
      categories,
      categoriesRevision,
      source: "published"
    };
  }

  try {
    const products = JSON.parse(stored);
    if (!Array.isArray(products)) throw new Error("Catálogo persistido inválido.");
    const revision = unwrap(await redisCommand(["GET", REVISION_KEY], { required: false }));
    const categories = readCategories(categoriesFromProducts(products));
    const completeCategories = uniqueCategories([...categories, ...categoriesFromProducts(products)]);
    const storedCategoriesRevision = unwrap(await redisCommand(["GET", CATEGORIES_REVISION_KEY], { required: false }));
    return {
      products,
      revision: typeof revision === "string" ? revision : sha256(stored),
      categories: completeCategories,
      categoriesRevision: typeof storedCategoriesRevision === "string" ? storedCategoriesRevision : sha256(JSON.stringify(completeCategories)),
      source: "admin"
    };
  } catch (error) {
    console.error("Catálogo persistido inválido; usando catálogo publicado.", error.message);
    const categories = readCategories(baseCategories);
    return {
      products: baseProducts,
      revision: sha256(JSON.stringify(baseProducts)),
      categories,
      categoriesRevision: sha256(JSON.stringify(categories)),
      source: "published"
    };
  }
}

async function saveProducts(products, expectedRevision, categories, expectedCategoriesRevision) {
  const serialized = JSON.stringify(products);
  const current = await getProducts();
  const nextRevision = sha256(serialized);
  const nextCategories = uniqueCategories(Array.isArray(categories) ? categories : current.categories);
  const serializedCategories = JSON.stringify(nextCategories);
  const nextCategoriesRevision = sha256(serializedCategories);
  const categoriesRevision = String(expectedCategoriesRevision || current.categoriesRevision);
  const script = [
    "local currentProductsRevision = redis.call('GET', KEYS[2])",
    "if not currentProductsRevision then currentProductsRevision = ARGV[1] end",
    "local currentCategoriesRevision = redis.call('GET', KEYS[4])",
    "if not currentCategoriesRevision then currentCategoriesRevision = ARGV[5] end",
    "if currentProductsRevision ~= ARGV[2] or currentCategoriesRevision ~= ARGV[6] then return {0, currentProductsRevision, currentCategoriesRevision} end",
    "redis.call('SET', KEYS[1], ARGV[3])",
    "redis.call('SET', KEYS[2], ARGV[4])",
    "redis.call('SET', KEYS[3], ARGV[7])",
    "redis.call('SET', KEYS[4], ARGV[8])",
    "return {1, ARGV[4], ARGV[8]}"
  ].join("\n");
  const result = unwrap(await redisCommand([
    "EVAL", script, 4, PRODUCTS_KEY, REVISION_KEY, CATEGORIES_KEY, CATEGORIES_REVISION_KEY,
    current.revision, String(expectedRevision || ""), serialized, nextRevision,
    current.categoriesRevision, categoriesRevision, serializedCategories, nextCategoriesRevision
  ]));
  if (!Array.isArray(result) || Number(result[0]) !== 1) {
    return {
      status: "conflict",
      revision: Array.isArray(result) ? result[1] : current.revision,
      categoriesRevision: Array.isArray(result) ? result[2] : current.categoriesRevision
    };
  }
  return { status: "saved", revision: nextRevision, categoriesRevision: nextCategoriesRevision, categories: nextCategories };
}

module.exports = { getProducts, saveProducts };
