const express = require('express');
const { validationChecks,
	categoriesLoad,
	isLogged,
	checkIdAndGetPost,
	completeRenderParams,
	arrayChecks
} = require('./data/middlewares');

const { 
	home,
	createPost,
	commentPost,
	onePostRoute,
	votePost,
	userProfile,
    userFavs,
    addFav,
    deleteFav,
} = require('./postRoutes');

const { 
	doRegister,
	registerPlace,
	loginPlace,
	doLogin,
	doLogOut,
	forgetPass,
	resetPass
} = require('./userRoutes');

const globalRouter = () => {
	const router = express.Router();

	//APPLY MIDDLEWARES
	router.use('/', isLogged, categoriesLoad, completeRenderParams)

	//HOME
	router.get('/', home);

	//CREATE POST
	router.post('/post', createPost);

	//COMENT POST
	router.post('/comment/:postId', checkIdAndGetPost, commentPost);

	//VOTE POST
	router.post('/vota/:postId/:type', checkIdAndGetPost, votePost)

	//ONE SINGLE POST PAGE
	router.get('/post/:postId', checkIdAndGetPost, onePostRoute)

	//PROFILES PAGE
	router.get('/perfil/:user', userProfile)

	//FAVS PAGE
	router.get('/favs', userFavs)

	//ADD FAV FOR USERS
	router.post('/addfav/:postId', checkIdAndGetPost, addFav)

	//DELETE FAV FOR USERS
	router.delete('/addfav/:postId', checkIdAndGetPost, deleteFav)

	//REGISTER PAGE
	router.get('/register', registerPlace)

	//REGISTER
	router.post('/register', arrayChecks, validationChecks, doRegister)

	//LOGIN PAGE
	router.get('/login', loginPlace)

	//LOGIN
	router.post('/login', doLogin)

	//LOGOUT
	router.get('/logOut', doLogOut)

	//FORGET PASS

	router.post('/forgetpass', forgetPass)

	router.use('/resetpass', resetPass)

	return router;
}

module.exports = {
	globalRouter
}