const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
	type: Number,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Votes = mongoose.model('Votes', schema);

module.exports = Votes;