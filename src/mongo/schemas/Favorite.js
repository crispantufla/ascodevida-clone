const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true  },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true  },
	createdAt: { type: Date, default: Date.now }
});

const Favorite = mongoose.model('favorite', schema);

module.exports = Favorite;