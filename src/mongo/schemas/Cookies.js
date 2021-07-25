const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	token: String,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	createdAt: { type: Date, default: Date.now }
});

const Cookies = mongoose.model('cookies', schema);

module.exports = Cookies;