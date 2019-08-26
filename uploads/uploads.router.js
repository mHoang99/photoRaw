const express = require('express');
const multer = require('multer');
const fs = require('fs');
var path = require('path');
var Jimp = require('jimp');
const UserModel = require('../users/users.model');


const uploadRouter = express.Router();
const upload = multer({
    dest: 'public'
});

uploadRouter.post('/image', upload.single('image'), (req, res) => {
    console.log(req.file);
    console.log(req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]);
    let fixed = `${req.file.filename}.${req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]}`;
    console.log(fixed);
    fs.rename(`public/${req.file.filename}`, `public/${fixed}`, (err) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            })
        } else {
            Jimp.read(`public/${fixed}`, (err, data) => {
                if (err) throw err;
                data
                    .resize(720, Jimp.AUTO) // resize
                    .quality(100) // set JPEG quality
                    .write(`public/thumbnail/${fixed}`); // save
            });
            res.json({
                success: true,
                data: {
                    imageUrl: `http://localhost:3000/upload/${fixed}`
                }
            });
        }
    });
});

uploadRouter.get('/:filename', (req, res) => {
    res.sendFile(path.resolve(`public/thumbnail/${req.params.filename}`));
});

uploadRouter.get(('/sourceImg/:img'), (req, res) => {
    if (req.session.currentUser) {
        UserModel.findOne({ _id: req.session.currentUser.id }, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            } else if (data) {
                data.bought.forEach(element => {
                    if (req.params.img === element) {
                        res.sendFile(path.resolve(`public/${req.params.img}`));
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Unauthenticated',
                });
            }
        });
    } else {
        res.status(400).json({
            success: true,
            message: 'redirecting',
        });
    }
});

module.exports = uploadRouter;