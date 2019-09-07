const express = require('express');
const UserModel = require('./users.model');
const userRouter = express.Router();
const bcryptjs = require('bcryptjs');
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

userRouter.get('/currentFind', (req, res) => {
    if (req.session.currentUser) {
        UserModel.findOne({ email: req.session.currentUser.email }, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            } else if (data) {
                req.session.currentUser = {
                    id: data._id,
                    email: data.email,
                    fullName: data.fullName,
                    avaUrl: data.avaUrl,
                };
                console.log(req.session.currentUser);
                res.status(201).json({
                    success: true,
                    message: 'login successfully',
                    data: {
                        id: data._id,
                        email: data.email,
                        fullName: data.fullName,
                        dob: data.dateOfBirth,
                        address: data.address,
                        avaUrl: data.avaUrl,
                        city: data.city,
                        country: data.country,
                        message: data.message,
                        phoneNumber: data.phoneNumber,
                        favourite: data.favourite
                    }
                });
                req.session.cookie.expires = false;
            }
        });
    }
    else {
        res.json({
            success: true,
        })
    }
    console.log(req.headers.cookie);
});

userRouter.get('/current', (req, res) => {
    if (req.session.currentUser) {
        res.json({
            success: true,
            data: {
                ...req.session.currentUser,
            }
        })
    }
    else {
        res.json({
            success: true,
        })
    }
    console.log(req.headers.cookie);
});

userRouter.post('/resession', (req, res) => {
    UserModel.findOne({ email: req.body.email, fullName: req.body.fullName }, (error, data) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        } else if (data) {
            req.session.currentUser = {
                id: data._id,
                email: data.email,
                fullName: data.fullName,
                avaUrl: data.avaUrl,
            };
            console.log(req.session.currentUser);
            res.status(201).json({
                success: true,
                message: 'login successfully',
                data: {
                    id: data._id,
                    email: data.email,
                    fullName: data.fullName,
                    dob: data.dateOfBirth,
                    address: data.address,
                    avaUrl: data.avaUrl,
                    city: data.city,
                    country: data.country,
                    message: data.message,
                    phoneNumber: data.phoneNumber
                }
            });
            req.session.cookie.expires = false;
        }
    });
});

userRouter.post('/register', (req, res) => {
    // email + pw from + fullname req.body

    const { email, password, fullName } = req.body;

    // validate email ,pw ,fullname
    if (!email || !emailRegex.test(email)) {
        res.status(400).json({
            success: false,
            message: 'Please input a valid email',
        });
    } else if (!password || password.length < 6) {
        res.status(400).json({
            success: false,
            problems: "password",
            message: 'Password must contains at least 6 characters',
        });
    } else if (!fullName) {
        res.status(400).json({
            success: false,
            message: 'input your Name',
        });
    } else {
        UserModel.findOne({ email: email }, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            } else if (data) {
                res.status(400).json({
                    success: false,
                    problems: "email",
                    message: 'Email has been used'
                })
            } else {
                //hash password
                const hashPassword = bcryptjs.hashSync(password, 10);

                UserModel.create(({
                    ...req.body,
                    password: hashPassword,
                }), (err, newUser) => {
                    if (err) {
                        res.status(500).json({
                            success: false,
                            message: err.message,
                        });
                    } else {
                        res.status(201).json({
                            success: true,
                            data: {
                                ...newUser._doc,
                                password: '',
                            },
                        });
                    }


                });
            }
        });
    }

});

userRouter.post('/update', (req, res) => {

    const { fullName, dob, address, avaUrl, email, city, country, phoneNumber, message } = req.body;
    UserModel.findOneAndUpdate({ email: email }, { fullName: fullName, dateOfBirth: dob, address: address, avaUrl: avaUrl, city: city, country: country, phoneNumber: phoneNumber, message: message }, ((error, data) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        } else if (data) {
            res.status(201).json({
                success: true,
                message: 'Updated successfully',
            });
        }
    }));

});

userRouter.post('/login', (req, res) => {
    //get email + pw from req.body;

    const { email, password, keepLogin } = req.body;
    console.log(keepLogin);
    UserModel.findOne({ email: email }, (error, data) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        } else if (!data) {
            res.status(400).json({
                success: false,
                problems: '1',
                message: 'Account does not exist',
            });
        } else if (data) {
            if (bcryptjs.compareSync(password, data.password)) {
                if (keepLogin) {
                    //local storage
                    req.session.currentUser = {
                        id: data._id,
                        email: data.email,
                        fullName: data.fullName,
                    };
                    res.status(201).json({
                        success: true,
                        message: 'login successfully',
                        data: {
                            email: data.email,
                            fullName: data.fullName,
                        },
                    });
                    req.session.cookie.expires = false;
                } else {
                    //session storage
                    req.session.currentUser = {
                        id: data._id,
                        email: data.email,
                        fullName: data.fullName,
                    };
                    res.status(201).json({
                        success: true,
                        message: 'login successfully',
                    });

                }
            } else {
                res.status(400).json({
                    success: false,
                    problems: '2',
                    message: 'Wrong password',
                });
            }
        }
    });
});

userRouter.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        } else {
            res.status(200).json({
                success: true,
                message: 'Logout success',
            });
        }
    });
});



module.exports = userRouter;

