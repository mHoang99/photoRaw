//email => required, unique 
//password => required
//fullName => required
//createdAt

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
    dateOfBirth: {
        type: String,
    },
    avaUrl: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png'
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;