require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const globalRouter = require('./src/controllers/globalRouter').globalRouter;
const initFirstCategory = require('./src/mongo/initFirstCategory');
const connect = require('./src/mongo').connect;

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
	origin: '*',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static(__dirname + "/public"));

app.set('views', './views');
app.set('view engine', 'ejs');

app.use('/', globalRouter());
app.use((req, res, next) => {
    res.status(404).render("404");
})

app.on('ready', () => {
    app.listen(PORT, () => {
        console.log(`App listening at http://localhost:${PORT}`)
		initFirstCategory();
    })
})

connect();
mongoose.connection.once('open', () => app.emit('ready'));

console.log(process.env.MAILER_USER)