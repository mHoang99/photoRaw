const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    message: {
        type: String,
    },
    country: {
        type: String,
    },
    phoneNumber: {
        type:String,
    },
    city: {
        type: String,
    },
    dateOfBirth: {
        type: String,
    },
    avaUrl: {
        type: String,
        default: 'https://i0.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png'
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    uploaded: {
        type: Array,
        default: [],
    },
    bought: {
        type: Array,
        default: [],
    },
    visited: {
        type: [Number],
    },
    favourite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;