const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	name: String,
	shortName: String
});

const Category = mongoose.model('Category', schema);

module.exports = Category;