const mongoose = require('mongoose');
require('dotenv').config();

const connect = async () => {
    await mongoose.connect('mongodb+srv://admin:1234@cluster0.9lknw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true ,useNewUrlParser: true, useCreateIndex: true })
}

connect();