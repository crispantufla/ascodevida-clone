require('./connection');
const { initFirstCategory } = require('./initFirstCategory');
const User = require('./schemas/User');
const Post = require('./schemas/Post');
const Category = require('./schemas/Category');
const Votes = require('./schemas/Votes');
const VerifyPassCode = require('./schemas/VerifyPassCode');
const Cookies = require('./schemas/Cookies');
const Favorite = require('./schemas/Favorite');

initFirstCategory(Category);

module.exports = {
	user: User,
	post: Post,
	category: Category,
	votes: Votes,
	verifyPassCode: VerifyPassCode,
	cookies: Cookies,
	favorite: Favorite
};