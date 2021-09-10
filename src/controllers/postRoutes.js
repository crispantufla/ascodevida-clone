const models = require('../mongo');
const mongoose = require('mongoose');

const checkCommentsAndFavs = async (posts, req) => {
    for (let x = 0; x < posts.length; x++) {
        let totalComments = await models.comment.countDocuments({ post: posts[x]._id });
        posts[x].totalComments = totalComments;
        if (req.isLogged) {
            let fav = await models.favorite.findOne({ post: posts[x]._id, user: req.user._id });
            posts[x].alreadyFav = !!fav;
        }
    }
}

const home = async (req, res) => {
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
        req.renderParams.needPagination = false;
    }

    let skip = (currentPage - 1) * limit;
    if (skip < 0) {
        return res.redirect('/')
    }

    finalQuery = finalQuery.limit(limit).skip(skip).lean();

    if (req.query.sort == "aleatorio") {
        finalQuery = models.post.aggregate().sample(limit);
        req.renderParams.needPagination = false;
    }

    return finalQuery.then(async (posts) => {
        await checkCommentsAndFavs(posts, req);
        req.renderParams.totalPages = totalPages;
        req.renderParams.currentPage = currentPage;
        req.renderParams.place = "home";
        req.renderParams.posts = posts;
        req.renderParams.titleWeb = 'ADV / Posts'
        res.status(200).render('index', req.renderParams);
    }).catch(err => {
        console.log(err)
        res.status(500).send({ error: err })
    })
}

const createPost = async (req, res) => {
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
}

const commentPost = (req, res) => {
    if (!req.isLogged) {
        return res.send({ message: "Solo usuarios registrados pueden comentar" })
    }

    let comment = new models.comment({
        content: req.body.content,
        user: req.user._id,
        post: req.params.postId
    })
    
    return comment.save().then(() => {
        res.redirect('/post/' + req.params.postId)
    }).catch(err => {
        res.status(500).send({ error: err })
    })
}

const votePost = async (req, res) => {
    if (!req.isLogged) {
        return res.send({ message: "Solo usuarios registrados pueden votar" })
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
}

const onePostRoute = async (req, res) => {
    if (req.isLogged) {
        let fav = await models.favorite.findOne({ post: req.params.postId, user: req.user._id });
        req.post[0].alreadyFav = !!fav;
    }

    let totalComments = await models.comment.countDocuments(models.comment.find({ post: req.params.postId }));
    req.post[0].totalComments = totalComments;
    if (totalComments < 50) {
        req.renderParams.needPagination = false;
    }

    //pagination to comments
    let currentPage = 1;
    if (req.query.page) {
        currentPage = req.query.page;
    }
    let limit = 50;
    let totalPages = Math.ceil(totalComments / limit);
    if (totalPages <= 1) {
        req.renderParams.needPagination = false;
    }

    let skip = (currentPage - 1) * limit;
    if (skip < 0) {
        return res.redirect('/')
    }

    let comments = await models.comment.find({ post: req.params.postId }).populate('user', 'nickname').limit(limit).skip(skip);

    req.renderParams.place = "home";
    req.renderParams.posts = req.post;
    req.renderParams.comments = comments;
    req.renderParams.totalPages = totalPages;
    req.renderParams.currentPage = currentPage;
    req.renderParams.titleWeb = 'ADV / Mis posts';
    return res.status(200).render('index', req.renderParams);
}

const userProfile = async (req, res) => {
    let user = await models.user.findOne({ nickname: { "$regex": `^${req.params.user}$`, "$options": "i" } });
    if (!user) {
        return res.redirect(301, '/')
    }
    return models.post.find({user: user._id})
    .populate('category', ['name', 'shortName'])
    .populate('user', 'nickname')
    .then(async posts => {
        await checkCommentsAndFavs(posts, req);
        req.renderParams.needPagination = false;
        req.renderParams.place = "home";
        req.renderParams.posts = posts;
        req.renderParams.titleWeb = 'ADV / Mis posts'
        res.status(200).render('index', req.renderParams);
    }).catch(err => {
        res.status(500).send({ error: err })
        console.log(err)
    })
}

const userFavs = (req, res) => {
    console.log("hola")
    if ( !req.isLogged ) {
        return res.redirect(301, '/')
    }
    return models.favorite.find({user: req.user.id}).populate('post').then(userFavorites => {
        userFavorites = userFavorites.map(item => {
            console.log(item)
            item.post.alreadyFav = true;
            return item.post;
        });

        req.renderParams.needPagination = false;
        req.renderParams.place = "home";
        req.renderParams.posts = userFavorites;
        req.renderParams.titleWeb = 'ADV / Favoritos'
        res.status(200).render('index', req.renderParams);
    }).catch(err => {
        res.status(500).send({ error: err })
    })
}

const addFav = (req, res) => {
    let favorite = new models.favorite({
        user: req.user._id,
        post: req.params.postId
    })
    return favorite.save().then(
        res.send({ message: "ADV añadido" })
    ).catch(err => {
        res.status(500).send({ error: err })
    })
}

const deleteFav = (req, res) => {
    return models.favorite.deleteOne({
        user: req.user._id,
        post: req.params.postId
    }).then(
        res.send({ message: "Eliminado de Favoritos" })
    ).catch(err => {
        res.status(500).send({ error: err })
    })
}

module.exports = {
    home,
    createPost,
    commentPost,
    votePost,
    onePostRoute,
    userProfile,
    userFavs,
    addFav,
    deleteFav,
}