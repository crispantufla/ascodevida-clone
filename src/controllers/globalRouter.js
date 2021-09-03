const express = require('express');
const models = require('../mongo');
const { validationChecks, categoriesLoad, isLogged } = require('./data/middlewares');
const { check } = require('express-validator');
const rand = require('csprng');
const CryptoJS = require("crypto-js");
const mongoose = require('mongoose');

const globalRouter = () => {
	const router = express.Router();

	router.use('/', isLogged, categoriesLoad, (req, res, next) => {
		router.renderParams = {
			categories: req.categories,
			isLogged: req.isLogged,
			response: "empty",
			user: (req.isLogged ? req.user.nickname : null),
			titleWeb: 'ADV',
			needPagination: true
		}

		next()
	})

	//HOME
	router.get('/', async (req, res) => {
		let finalQuery = {};
		let categoryQuery = null;

		if (req.query.category) {
			categoryQuery = await models.category.findOne({ shortName: req.query.category })
			if (categoryQuery) {
				finalQuery.category = categoryQuery.id;
			}
		}

		if (req.query.search) {
			finalQuery.content = { "$regex": req.query.search, "$options": "i" }
		}

		let totalPosts = await models.post.countDocuments(finalQuery);
		finalQuery = models.post.find(finalQuery).populate('category', ['name', 'shortName']).populate('user', 'nickname');

		//validar req.query.type
		if (req.query.type) {
			finalQuery = finalQuery.sort({ [`type${req.query.type}`]: -1 })
		} else {
			finalQuery = finalQuery.sort({ createdAt: -1 })
		}

		//pagination
		let currentPage = 1;
		if (req.query.page) {
			currentPage = req.query.page;
		}
		let limit = 15;
		let totalPages = Math.ceil(totalPosts / limit);
		if (totalPages <= 1) {
			router.renderParams.needPagination = false;
		}

		let skip = (currentPage - 1) * limit;
		if (skip < 0) {
			return res.redirect('/')
		}

		finalQuery = finalQuery.limit(limit).skip(skip);

		if (req.query.sort == "aleatorio") {
			finalQuery = models.post.aggregate().sample(limit);
			router.renderParams.needPagination = false;
		}

		return finalQuery.then(async (posts) => {
			if (req.isLogged) {
				for (let x = 0; x < posts.length; x++) {
					let fav = await models.favorite.findOne({ post: posts[x]._id, user: req.user._id });
					posts[x].alreadyFav = !!fav;
				}
			}

			router.renderParams.totalPages = totalPages;
			router.renderParams.currentPage = currentPage;
			router.renderParams.place = "home";
			router.renderParams.posts = posts;
			router.renderParams.titleWeb = 'ADV / Posts'
			res.status(200).render('index', router.renderParams);
		}).catch(err => {
			console.log(err)
			res.status(500).send({ error: err })
		})
	})

	//CREATE POST
	router.post('/post', async (req, res) => {

		if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
			return res.redirect('/')
		}

		let searchCategory = await models.category.findOne({ _id: req.body.category })
		if (!searchCategory) {
			return res.redirect('/')
		}

		if (req.body.gender != "Hombre" && req.body.gender != "Mujer") {
			return res.redirect('/')
		}

		const whenArray = ["Hoy", "Ayer", "La semana pasada", "Hace unos meses", "Hace unos años", "Hace tiempo"];
		if (req.body.when < 0 || req.body.when >= whenArray.length) {
			return res.redirect('/')
		}

		let fixedContent = `${whenArray[req.body.when]} ${req.body.content}. ADV`;

		let postObject = {
			content: fixedContent,
			gender: req.body.gender,
			category: req.body.category,
			name: (req.isLogged ? req.user.nickname : req.body.name),
			user: (req.isLogged ? req.user._id : null)
		}

		let post = new models.post(postObject);
		return post.save().then(() => {
			res.redirect('/')
		}).catch(err => {
			res.status(500).send({ error: err })
		})
	})

	//VOTE POST
	router.post('/vota/:postId/:type', async (req, res) => {
		if (!req.isLogged) {
			return res.send({ message: "Solo usuarios registrados pueden votar" })
		}

		if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
			return res.status(404).send({ message: "estoy aca La id del post es erronea." })
		}

		const post = await models.post.findById(req.params.postId);
		if (!post) {
			return res.status(404).send({ message: "La id del post es erronea." })
		}

		if (req.params.type > 3 || req.params.type < 1) {
			return res.status(404).send({ message: "404 oops algo salio mal con ese voto" })
		}

		let message = ["Aunque podría ser peor", "Y no vengas llorando", "Esto no pinta nada aquí"];
		let vote = new models.votes({
			post: req.params.postId,
			type: req.params.type,
			user: req.user._id
		});
		const hasAlreadyVote = await models.votes.findOne({ post: vote.post, user: vote.user });
		if (hasAlreadyVote) {
			return res.send({ message: "Que no habias votado aqui ya?" })
		}

		return vote.save().then(result => {
			models.post.findByIdAndUpdate(result.post, {
				$push: { votes: result.id }, $inc: { [`type${result.type}`]: 1 }
			}).then(
				res.status(200).send({ message: message[req.params.type - 1] })
			).catch(err => {
				res.status(500).send({ error: err })
			})
		})
	})

	router.get('/:postId', async (req, res) => {
		if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
			return res.redirect('/')
		}

		models.post.find({_id: req.params.postId}).then( async (post) => {
			if (req.isLogged) {
				let fav = await models.favorite.findOne({ post: post._id, user: req.user._id });
				post.alreadyFav = !!fav;
			}
			router.renderParams.needPagination = false;
			router.renderParams.place = "home";
			router.renderParams.posts = post;
			router.renderParams.titleWeb = 'ADV / Mis posts';
			return res.status(200).render('index', router.renderParams);
		})
	})

	//USERS POSTS
	router.get('/perfil', (req, res) => {
		return models.post.find({user: req.user.id})
			.populate('category', ['name', 'shortName'])
			.populate('user', 'nickname')
			.then(posts => {
			router.renderParams.needPagination = false;
			router.renderParams.place = "home";
			router.renderParams.posts = posts;
			router.renderParams.titleWeb = 'ADV / Mis posts'
			res.status(200).render('index', router.renderParams);
		}).catch(err => {
			res.status(500).send({ error: err })
			console.log(err)
		})
	})

	//FAVS, ADD AND DELETE FAVS
	router.get('/favoritos', (req, res) => {
		return models.favorite.find({user: req.user.id}).populate('post').then(userFavorites => {
			userFavorites = userFavorites.map(item => {
				item.post.alreadyFav = true;
				return item.post;
			});
			router.renderParams.needPagination = false;
			router.renderParams.place = "home";
			router.renderParams.posts = userFavorites;
			router.renderParams.titleWeb = 'ADV / Favoritos'
			res.status(200).render('index', router.renderParams);
		}).catch(err => {
			res.status(500).send({ error: err })
		})
	})

	router.post('/addfav/:postId', async (req, res) => {
		if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
			return res.status(404).send({ message: "La id del post es erronea." })
		}

		const post = await models.post.findById(req.params.postId);
		if (!post) {
			return res.status(404).send({ message: "La id del post es erronea." })
		}

		let favorite = new models.favorite({
			user: req.user._id,
			post: req.params.postId
		})
		return favorite.save().then(
			res.send({ message: "ADV añadido" })
		).catch(err => {
			res.status(500).send({ error: err })
		})
	})

	router.delete('/addfav/:postId', (req, res) => {
		if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
			return res.status(404).send({ message: "La id del post es erronea." })
		}

		const post = await models.post.findById(req.params.postId);
		if (!post) {
			return res.status(404).send({ message: "La id del post es erronea." })
		}
		
		return models.favorite.deleteOne({
			user: req.user._id,
			post: req.params.postId
		}).then(
			res.send({ message: "Eliminado de Favoritos" })
		).catch(err => {
			res.status(500).send({ error: err })
		})
	})

	//REGISTRARSE Y LOGEARSE 

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

	router.get('/register', (req, res) => {
		router.renderParams.place = "register";
		router.renderParams.titleWeb = 'ADV / Registro'
		res.status(200).render('index', router.renderParams);
	})

	router.post('/register', arrayChecks, validationChecks, async (req, res) => {
		router.renderParams.place = "register";

		if (req.validationChecksError) {
			router.renderParams.response = { errorMsg: req.validationChecksError };
			console.log(req.validationChecksError)
			return res.status(409).render('index', router.renderParams);
		}

		let user = new models.user(req.body);
		user.password = CryptoJS.SHA256(user.password);
		let users = await models.user.find(({ $or: [{ email: user.email }, { nickname: user.nickname }] }));
		if (users.length == 0) {
			return user.save().then(() => {
				res.redirect('/')
			}).catch((err) => {
				router.renderParams.response = { errorMsg: err };
				res.status(409).render('index', router.renderParams.response);
			});
		}

		if (users[0].email == user.email) {
			router.renderParams.response = { errorMsg: 'Email ya registrado' };
			return res.status(409).render('index', router.renderParams);
		}

		router.renderParams.response = { errorMsg: 'Usuario ya registrado' };
		res.status(409).render('index', router.renderParams);
	})

	router.get('/login', (req, res) => {
		router.renderParams.place = "login";
		router.renderParams.titleWeb = 'ADV / Login'
		res.status(200).render('index', router.renderParams);
	})

	router.post('/login', async (req, res) => {
		router.renderParams.place = "login";
		const user = req.body;
		user.password = CryptoJS.SHA256(user.password);
		user.password = user.password.toString(CryptoJS.enc.Hex);
		let resultUser = await models.user.findOne({ nickname: user.nickname });
		if (resultUser) {
			if (resultUser.password == user.password) {
				let token = rand(300, 36);
				let cookie = new models.cookies({ token: token, user: resultUser._id });
				cookie.save();
				res.cookie('userLog', token);
				return res.redirect('/');
			} else {
				router.renderParams.response = { errorMsg: "Contraseña invalida" };
				return res.status(409).render('index', router.renderParams);
			}
		} else {
			router.renderParams.response = { errorMsg: "Usuario invalido" };
			res.status(409).render('index', router.renderParams);
		}
	})

	router.get('/logOut', (req, res) => {
		res.clearCookie('userLog');
		return res.redirect('/');
	})

	//FORGET PASS

	router.post('/forgetpass', async (req, res) => {
		const { email } = req.body;
		const user = await models.user.find({ email });
		if (user.length > 0) {
			const codeThere = await models.verifyPassCode.find({ email });
			if (codeThere.length < 1) {
				const code = Math.round((Math.random() * 9000) + 1000);
				const verifyCode = new models.verifyPassCode({ email, verifyPassCode: code });
				return verifyCode.save().then(() => {
					res.status(200).send({ message: code })
				}).catch((err) => {
					res.status(500).send({ error: err })
				})
			}
			return res.status(409).send({ message: 'Ya has solicitado un cambio de contraseña, Por favor revisa tu Email' })
		}
		res.status(409).send({ message: 'Email incorrect' })
	})

	router.use('/resetpass', async (req, res) => {
		const { verifyPassCode, password, email } = req.body;
		const passCode = await models.verifyPassCode.find({ verifyPassCode: verifyPassCode });
		if (passCode.length > 0 && passCode[0].email === email) {
			await models.user.findOneAndUpdate({ email: passCode[0].email }, { password })
				.then(savedUser => {
					if (savedUser) {
						res.status(200).send({ message: 'La contraseña de ha cambiado correctamente' });
						return models.verifyPassCode.findByIdAndDelete(passCode[0].id);
					};
				}).catch((err) => {
					res.status(500).send({ error: err })
				});
		} else {
			res.status(409).send({ message: 'Algo no sucedio como se lo esparaba' })
		}
	})

	return router;
}

module.exports = {
	globalRouter
}