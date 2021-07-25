const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	content: String,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	name: String,
	gender: String,
	category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
	createdAt: { type: Date, default: Date.now },
	votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Votes' }],
	type1: Number,
	type2: Number,
	type3: Number
});

const Post = mongoose.model('Post', schema);

module.exports = Post;