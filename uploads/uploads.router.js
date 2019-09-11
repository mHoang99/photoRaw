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
const uploadAvatar = multer({
    dest: 'public/avatar'
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
                    .quality(90) // set JPEG quality
                    .write(`public/thumbnail/${fixed}`); // save
            });
            res.json({
                success: true,
                data: {
                    imageUrl: `http://localhost:3001/upload/${fixed}`
                }
            });
        }
    });
});

uploadRouter.post('/avatar', uploadAvatar.single('image'), (req, res) => {
    console.log(req.file);
    console.log(req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]);
    let fixed = `${req.file.filename}.${req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]}`;
    console.log(fixed);
    fs.rename(`public/avatar/${req.file.filename}`, `public/avatar/${fixed}`, (err) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            })
        } else {
            Jimp.read(`public/avatar/${fixed}`, (err, data) => {
                if (err) throw err;
                data
                    .resize(200, Jimp.AUTO) // resize
                    .quality(100) // set JPEG quality
                    .write(`public/avatar/${fixed}`); // save
            });
            res.json({
                success: true,
                data: {
                    avaUrl: `http://localhost:3001/upload/avatar/${fixed}`
                }
            });
        }
    });
});

uploadRouter.get('/logo', (req, res) => {
    res.sendFile(path.resolve(`public/LOGO/LOGO.PNG`));
});

uploadRouter.get('/logo2', (req, res) => {
    res.sendFile(path.resolve(`public/LOGO/LOGO2.PNG`));
});



uploadRouter.get('/avatar/:filename', (req, res) => {
    res.sendFile(path.resolve(`public/avatar/${req.params.filename}`));
});


uploadRouter.get('/:filename', (req, res) => {
    res.sendFile(path.resolve(`public/thumbnail/${req.params.filename}`));
});

uploadRouter.get(('/sourceImg/:img/:id'), (req, res) => {
    if (req.session.currentUser) {
        UserModel.findOne({ _id: req.session.currentUser.id }, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            } else if (data) {
                data.bought.forEach(element => {
                    if (req.params.id === element) {
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