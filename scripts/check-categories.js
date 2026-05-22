const ingredients = require('./skincare-research/data/ingredient-database.json');
const categories = new Set(ingredients.map(i => i.category));
console.log('Ingredient categories:', [...categories]);

const products = require('./skincare-research/data/product-seed.json');
const prodCats = new Set(products.map(p => p.category));
console.log('Product categories:', [...prodCats]);
