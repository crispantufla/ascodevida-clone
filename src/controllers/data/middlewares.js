const { validationResult } = require('express-validator');
const models = require('../../mongo');

const validationChecks = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		let error = {}; errors.array().map((err) => error = err.msg);
		return res.status(409).render(req.url.slice(1), {
			categories: req.categories,
			response : { errorMsg: error }
		});
	}

	next();
}

const categoriesLoad = async (req, res, next) => {
	let categories = await models.category.find().sort({ name: 1 });
	req.categories = categories;
	next();
};

const isLogged = async (req, res, next) => {
	req.isLogged = false;
	if (req.cookies.userLog) {
		req.isLogged = true;
		const user = await models.cookies.findOne({ token: req.cookies.userLog }).populate('user', ['nickname', 'email']);
		req.user = user.user;
		if (req.url == '/login' || req.url =='/register') {
			return res.redirect('/')
		};
	};
	next();
};

module.exports = {
	validationChecks,
	categoriesLoad,
	isLogged
};