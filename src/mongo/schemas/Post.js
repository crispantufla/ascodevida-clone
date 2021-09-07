const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	content: { type: String, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	name: { type: String, required: true },
	gender: { type: String, required: true },
	category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
	createdAt: { type: Date, default: Date.now },
	votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Votes' }],
	type1: Number,
	type2: Number,
	type3: Number
});

const Post = mongoose.model('Post', schema);

module.exports = Post;