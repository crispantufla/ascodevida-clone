const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	email: String,
	verifyPassCode: String,
	createdAt: { type: Date, default: Date.now }
});

const VerifyPassCode = mongoose.model('VerifyPassCode', schema);

module.exports = VerifyPassCode;