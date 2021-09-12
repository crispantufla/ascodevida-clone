const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	email: { type: String, required: true },
	verifyPassCode: { type: String, required: true },
	createdAt: { type: Date, expires: '10m', default: Date.now }
});

const VerifyPassCode = mongoose.model('VerifyPassCode', schema);

module.exports = VerifyPassCode;