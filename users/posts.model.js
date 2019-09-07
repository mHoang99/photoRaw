const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
        required: true,
    },

    sold: {
        type: Number,
        default: 0,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    imageUrl: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
        required: true,
    },
    categories: {
        type: Array,
        default: [],
        required: true,
    },
    mainColor:{
        type: String,
        required: true,
    },
    comment:{
        type: Number,
        required: true,
        default: 0,
    }
});

const PostsModel = mongoose.model('Post', PostSchema);

module.exports = PostsModel;