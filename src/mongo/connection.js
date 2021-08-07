const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect('mongodb+srv://admin:1234@cluster0.9lknw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true ,useNewUrlParser: true, useCreateIndex: true })
.then(db => console.log('db connected')).catch( err => console.log(err));