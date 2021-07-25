const mongoose = require('mongoose');
require('dotenv').config();
const databaseHost = process.env.DATABASE_HOST || 'localhost';
const databasePort = process.env.DATABASE_PORT || '27017';
const databaseName = process.env.DATABASE_NAME || 'adv';
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;
const databaseURL = process.env.DATABASE_URL;

if (databaseURL) {
	mongoose.connect(databaseURL, { useNewUrlParser: true, useCreateIndex: true });
} else {
	if (databaseUser && databasePassword) {
		mongoose.connect(`mongodb://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}?authSource=admin`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
	} else {
		mongoose.connect(`mongodb://${databaseHost}:${databasePort}/${databaseName}?authSource=admin`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
	}
};