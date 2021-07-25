require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const cors = require('cors');
const globalRouter = require('./src/controllers/globalRouter').globalRouter;

const app = express();
const port = 3001;
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



app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
})