const { validationResult } = require('express-validator');
const { check } = require('express-validator');
const models = require('../../mongo');
const mongoose = require('mongoose');

const validationChecks = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		let error = {}; errors.array().map((err) => error = err.msg);
		req.validationChecksError = error;
		return next();
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
		if (!user) {
			res.clearCookie('userLog');
			return res.redirect('/')
		}

		req.user = user.user;
		if (req.url == '/login' || req.url == '/register') {
			return res.redirect(301, '/')
		};
	};

	next();
};

const checkIdAndGetPost = async (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
		return res.status(404).send({ message: "La id del post es erronea." })
	}

	const post = await models.post.find({_id: req.params.postId}).lean();
	if (!post) {
		return res.status(404).send({ message: "La id del post es erronea." })
	}
	req.post = post;
	next();	
}

const completeRenderParams = (req, res, next) => {
	req.renderParams = {
		categories: req.categories,
		isLogged: req.isLogged,
		response: "empty",
		user: (req.isLogged ? req.user.nickname : null),
		titleWeb: 'ADV',
		needPagination: true,
		comments: false
	}

	next()
}

const arrayChecks = [
	check('email')
		.normalizeEmail()
		.isEmail()
		.withMessage('Introduzca una dirección de correo electrónico válida'),
	check('password')
		.isStrongPassword({
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1
		})
		.withMessage('Tu contraseña debe contener almenos 8 caracteres, debe contener almenos una mayuscula y una minuscula y un simbolo'),
	check('nickname')
		.custom(value => !/\s/.test(value))
		.withMessage('No se permiten espacios')
		.isLength({ min: 3, max: 16 })
		.withMessage('Tu Usuario debe contener almenos 6 caracteres y maximo 12')
]

module.exports = {
	validationChecks,
	categoriesLoad,
	isLogged,
	checkIdAndGetPost,
	completeRenderParams,
	arrayChecks
};