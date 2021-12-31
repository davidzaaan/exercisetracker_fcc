const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI; // this will access to the database on Mongo Atlas
mongoose.connect(uri)
// mongoose.connect('mongodb://localhost/21017')

const Schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    count: {
        type: Number,
        default: 0
    },
    log: []
}, { versionKey: false });

const User = mongoose.model('User', Schema);

module.exports = User;