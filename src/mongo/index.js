const mongoose = require('mongoose');

const User = require('./schemas/User');
const Post = require('./schemas/Post');
const Category = require('./schemas/Category');
const Votes = require('./schemas/Votes');
const VerifyPassCode = require('./schemas/VerifyPassCode');
const Cookies = require('./schemas/Cookies');
const Favorite = require('./schemas/Favorite');

const connect = async () => {
    console.log("try to connect")
    await mongoose.connect('mongodb+srv://admin:1234@cluster0.9lknw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true ,useNewUrlParser: true, useCreateIndex: true })
    console.log("db connect")
}

module.exports = {
	user: User,
	post: Post,
	category: Category,
	votes: Votes,
	verifyPassCode: VerifyPassCode,
	cookies: Cookies,
	favorite: Favorite,
	connect: connect
}