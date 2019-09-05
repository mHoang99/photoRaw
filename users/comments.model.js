const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: 'String',
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});

const CommentModel = mongoose.model('Comment', CommentSchema);

module.exports = CommentModel;