const express = require('express');
const UserModel = require('./users.model');
const PostModel = require('./posts.model');

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
                        favourite: data.favourite,
                        bought: data.bought
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

userRouter.post('/updateBought', (req, res) => {
    UserModel.findOne({ email: req.body.email }, (error, data) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        } else if (data) {
            let bought = data.bought;
            if (req.body.id != bought.find(function (element) {
                return element === req.body.id;
            })) {
                bought.push(req.body.id);
                UserModel.findOneAndUpdate({ email: req.body.email }, { bought: bought }, (err, data1) => {
                    console.log("updating")
                    if (err) {
                        res.status(500).json({
                            success: false,
                            message: err.message,
                        })
                    }
                    else if (data) {
                        res.status(201).json({
                            updated: true,
                            success: true,
                        })
                    } else {
                        res.status(404).json({
                            success: false,
                            message: "err",
                        })
                    }
                })

            } else {
                res.status(201).json({
                    updated: false,
                    success: true,
                })
            }
        }
    });
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
                    phoneNumber: data.phoneNumber,
                    bought: data.bought
                }
            });
            req.session.cookie.expires = false;
        }
    });
});

userRouter.get('/recommend', (req, res) => {
    if (req.session.currentUser) {
        UserModel.findOne({ email: req.session.currentUser.email }, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            } else if (data) {
                console.log(data.recommendColor);
                console.log(data.recommendCategory);
                var maxColor = 0;
                var maxCategory = 0;

                var temp = 0;
                for (let i = 0; i < data.recommendCategory.length; i++) {
                    if (temp < data.recommendCategory[i]) {
                        temp = data.recommendCategory[i];
                        maxCategory = i;
                    }
                }

                var temp2 = 0;
                for (let i = 0; i < data.recommendColor.length; i++) {
                    if (temp2 < data.recommendColor[i]) {
                        temp2 = data.recommendColor[i];
                        maxColor = i;
                    }
                }

                res.status(200).json({
                    success: true,
                    message: "success",
                    typeOfRecommendColor: maxColor,
                    typeOfRecommendCategory: maxCategory,
                })
            }

            else if (!data) {
                res.status(201).json({
                    success: true,
                    message: "Sth is wrong"
                })
            }

        });
    }
    else {
        console.log("Something is wrong!");
    }

    console.log(req.headers.cookie);
});

userRouter.post('/click-update', (req, res) => {
    if (req.session.currentUser) {
        const { recommendColor, recommendCategory } = req.body;
        UserModel.findOne({ email: req.session.currentUser.email }, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            } else if (data) {

                console.log("here", data);
                if (recommendColor == "red") { data.recommendColor[0]++; }
                else if (recommendColor == "yellow") { data.recommendColor[1]++; }
                else if (recommendColor == "green") { data.recommendColor[2]++; }
                else if (recommendColor == "blue") { data.recommendColor[3]++; }
                else if (recommendColor == "purple") { data.recommendColor[4]++; }
                else if (recommendColor == "pink") { data.recommendColor[5]++; }

                if (recommendCategory == "Landscape") { data.recommendCategory[0]++; }
                else if (recommendCategory == "Portrait") { data.recommendCategory[1]++; }
                else if (recommendCategory == "Animals/Wildlife") { data.recommendCategory[2]++; }
                else if (recommendCategory == "Sports") { data.recommendCategory[3]++; }
                else if (recommendCategory == "Food and Drink") { data.recommendCategory[4]++; }
                else if (recommendCategory == "Architecture") { data.recommendCategory[5]++; }

                UserModel.findOneAndUpdate({ email: req.session.currentUser.email }, { recommendCategory: data.recommendCategory, recommendColor: data.recommendColor }, (err, data1) => {
                    if (err) {
                        res.status(500).json({
                            success: false,
                            message: err.message,
                        })
                    }
                    else if (data1) {
                        console.log(data.recommendCategory,data1);
                        res.status(201).json({
                          
                            success: true,
                        })
                    } else {
                        res.status(404).json({
                            success: false,
                            message: "err",
                        })
                    }
                })

            }
            else if (!data) {
                res.status(404).json({
                    success: true,
                    message: "Sth is wrong"
                })
            }

        });
    }
    else {
        console.log("Something is wrong!");
    }

    console.log(req.headers.cookie);
});



userRouter.get('/sold-information', (req, res) => {
    if (req.session.currentUser) {
        UserModel.findOne({ email: req.session.currentUser.email }, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            } else if (data) {
                console.log(data._id);
                PostModel.find({ author: data._id }, (err, soldData) => {
                    console.log(data._id);
                    console.log(soldData);

                    if (err) {
                        res.status(500).json({
                            success: false,
                            message: err.message,
                        })
                    }
                    else if (soldData) {
                        res.status(200).json({
                            success: true,
                            soldData: soldData,
                        })
                    }
                })
            }
            else if (!data) {
                res.status(201).json({
                    success: true,
                    message: "you haven't sold anything!"
                })
            }

        });
    }
    else {
        console.log("Something is wrong!");
    }

    console.log(req.headers.cookie);
});

userRouter.get('/bought-information', (req, res) => {
    if (req.session.currentUser) {
        UserModel.findOne({ email: req.session.currentUser.email }, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            } else if (data) {
                console.log(data);

                PostModel.find({ _id: { $in: data.bought } }, (err, boughtData) => {
                    console.log(data.bought + ' 1');
                    console.log(boughtData);

                    if (err) {
                        res.status(500).json({
                            success: false,
                            message: err.message,
                        })
                    }
                    else if (boughtData) {
                        res.status(200).json({
                            success: true,
                            boughtData: boughtData,
                        })
                    }
                })
            }
            else if (!data) {
                res.status(201).json({
                    success: true,
                    message: "you haven't bought anything!"
                })
            }

        });
    }
    else {
        console.log("Something is wrong!");
    }
    console.log(req.headers.cookie);
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

userRouter.post('/search-by-author-name', (req, res) => {
    const { fullName } = req.body;
    UserModel.find({ fullName: { $regex: fullName, $options: 'i' } }, (error, data) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        }
        else if (!data) {
            res.status(501).json({
                success: false,
                message: "no author was found"
            })
        }
        else {
            console.log(data);
            console.log(req.body);
            let array = [];
            array.push(data);
            res.status(200).json({
                success: true,
                message: "test",
                data: data,
            });

        }
    });
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

