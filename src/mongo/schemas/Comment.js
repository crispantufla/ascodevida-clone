const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	content: { type: String, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
	createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', schema);

module.exports = Comment;