const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	token: { type: String, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	createdAt: { type: Date, default: Date.now }
});

const Cookies = mongoose.model('cookies', schema);

module.exports = Cookies;