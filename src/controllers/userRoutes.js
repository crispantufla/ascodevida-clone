const models = require('../mongo');
const rand = require('csprng');
const CryptoJS = require("crypto-js");
const { sendMail } = require('./data/nodemailer');

const doRegister = async (req, res) => {
    req.renderParams.place = "register";
    req.renderParams.previusForm = { nickname: req.body.nickname, email: req.body.email };

    if (req.validationChecksError) {
        req.renderParams.response = { errorMsg: req.validationChecksError };
        return res.status(409).render('index', req.renderParams);
    }

    let user = new models.user(req.body);
    user.password = CryptoJS.SHA256(user.password);
    let users = await models.user.find(({ $or: [{ email: user.email }, { nickname: { "$regex": user.nickname, "$options": "i" } }] }));
    if (users.length == 0) {
        return user.save().then(() => {
            res.redirect('/login')
        }).catch((err) => {
            req.renderParams.response = { errorMsg: err };
            res.status(409).render('index', req.renderParams.response);
        });
    }

    if (users[0].email == user.email) {
        req.renderParams.response = { errorMsg: 'Email ya registrado' };
        return res.status(409).render('index', req.renderParams);
    }

    req.renderParams.response = { errorMsg: 'Usuario ya registrado' };
    res.status(409).render('index', req.renderParams);
}

const registerPlace = (req, res) => {
    req.renderParams.place = "register";
    req.renderParams.titleWeb = 'ADV / Registro'
    req.renderParams.previusForm = false;
    res.status(200).render('index', req.renderParams);
}

const loginPlace = (req, res) => {
    req.renderParams.place = "login";
    req.renderParams.titleWeb = 'ADV / Login'
    req.renderParams.previusForm = false;
    res.status(200).render('index', req.renderParams);
}

const doLogin = async (req, res) => {
    req.renderParams.place = "login";
    const user = req.body;
    user.password = CryptoJS.SHA256(user.password);
    user.password = user.password.toString(CryptoJS.enc.Hex);
    let resultUser = await models.user.findOne({ nickname: user.nickname });
    req.renderParams.previusForm = { nickname: user.nickname };
    if (resultUser) {
        if (resultUser.password == user.password) {
            let token = rand(300, 36);
            let cookie = new models.cookies({ token: token, user: resultUser._id });
            cookie.save();
            res.cookie('userLog', token);
            return res.redirect('/');
        } else {
            req.renderParams.response = { errorMsg: "Contraseña invalida" };
            return res.status(409).render('index', req.renderParams);
        }
    } else {
        req.renderParams.response = { errorMsg: "Usuario invalido" };
        res.status(409).render('index', req.renderParams);
    }
}

const doLogOut = (req, res) => {
    res.clearCookie('userLog');
    return res.redirect('/');
}

const forgetPass = async (req, res) => {
    const { email } = req.body;
    const user = await models.user.findOne({ email });
    if (!!user) {
        const codeThere = await models.verifyPassCode.findOne({ email })
        if (!codeThere) {
            const code = Math.round((Math.random() * 9000) + 1000);
            const verifyCode = new models.verifyPassCode({ email, verifyPassCode: code });
            return verifyCode.save().then((savedCode) => {
                console.log("se guardo " + savedCode);
                sendMail(code, email);
                res.status(200).send({ message: code })
            }).catch((err) => {
                console.log(err);
                res.status(500).send({ error: err })
            })
        }
        return res.status(409).send({ message: 'Ya has solicitado un cambio de contraseña, Por favor revisa tu Email' })
    }
    res.status(409).send({ message: 'Email incorrect' })
}

const resetPass = async (req, res) => {
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
}

module.exports = {
    doRegister,
    registerPlace,
    loginPlace,
    doLogin,
    doLogOut,
    forgetPass,
    resetPass
}