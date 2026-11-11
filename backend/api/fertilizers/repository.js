const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "..", "..", "data", "fertilizers.json");

function readFertilizers() {
  return JSON.parse(fs.readFileSync(catalogPath, "utf8"));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getFertilizers(filters = {}) {
  let products = readFertilizers();
  const category = normalize(filters.category);
  const crop = normalize(filters.crop);

  if (category) {
    products = products.filter((product) => normalize(product.category) === category || normalize(product.sourceCategory) === category);
  }

  if (crop) {
    products = products.filter((product) => product.recommendedCrops.some((item) => normalize(item) === crop || normalize(item) === "all crops"));
  }

  return products;
}

function getFertilizerById(id) {
  return readFertilizers().find((product) => product.id === id);
}

module.exports = {
  getFertilizerById,
  getFertilizers
};
