const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	name: { type: String, required: true },
	shortName: { type: String, required: true }
});

const Category = mongoose.model('Category', schema);

module.exports = Category;