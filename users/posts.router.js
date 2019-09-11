const express = require('express');
const fs = require('fs');
var path = require('path');
const PostModel = require('./posts.model');
const CommentModel = require('./comments.model');
const colorThief = require('color-thief');
const onecolor = require('onecolor');
const paypal = require('paypal-rest-sdk');


postRouter = express.Router();

ColorThief = new colorThief();

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AaU8tQfmz1_MFDTKuf84yYERXvdDt2ZFJVrxhNW_49DazF4A_F0VBuKyV5_nntyEdZqUa5Oq9ZBj65GV',
    'client_secret': 'EAZ8aFDU4lHHLy1bQqULYWqznf3dBknXZW3AH__zFC0bUs8AGUyR6RNbm-jHvqtikX7PsSqMO5vxuvKm'
});

postRouter.post('/pay', (req, res) => {
    console.log(req.body);

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": req.body.id,
                    "sku": "001",
                    "price": req.body.price,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": req.body.price,
            },
            "description": "Image with Copyright"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.status(201).json({
                        success:true,
                        data:payment.links[i].href,
                    })
                }
            }
        }
    });

});

postRouter.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": req.body.price,
            }
        }]
    };


    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

postRouter.post('/create', (req, res) => {
    //check login state
    console.log('here');

    if (req.session.currentUser && req.session.currentUser.id) {
        fileName = req.body.imageUrl.split('/')[req.body.imageUrl.split('/').length - 1];
        var image = fs.readFileSync(path.resolve(`public/${fileName}`));
        var rgb = ColorThief.getColor(image);
        var rgbCode = 'rgb( ' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'; // 'rgb(r, g, b)'
        var hsv = onecolor(rgbCode).hsv();

        /*
            red 351<hsl<20
            yellow 21<hsl<60
            green 61<hsl<160
            blue  161<hsl<260
            purple 261<hsl<300
            pink 301<hsl<350
         */

        hue = Number(hsv._hue * 360);
        console.log(hue);
        var color;


        if (0 <= hue && hue <= 20) {
            color = 'red';
        } else if (hue <= 60) {
            color = 'yellow';
        } else if (hue <= 160) {
            color = 'green';
        } else if (hue <= 260) {
            color = 'blue';
        } else if (hue <= 300) {
            color = 'purple';
        } else if (hue <= 350) {
            color = 'pink';
        } else {
            color = 'red';
        }
        console.log(color);
        const newPost = {
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.body.imageUrl,
            author: req.session.currentUser.id,
            price: req.body.price,
            categories: req.body.categories,
            mainColor: color,
            createdAt: new Date()
        }
        PostModel.create(newPost, (error, data) => {
            if (error) {
                console.log(error.message);
                res.status(500).json({
                    success: false,
                    message: error.message,
                })
            } else {
                res.status(201).json({
                    success: true,
                    data: data,
                })
            }
        });

    } else {
        res.status(403).json({
            success: false,
            message: 'Unauthenticated',
        })
    }
});


postRouter.post('/updateViews', (req, res) => {
    //check login state

    PostModel.findOneAndUpdate({ _id: req.body.id }, { $inc: { views: 1 } }, (error, data) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        } else {
            res.status(201).json({
                success: true,
                message: 'success',
            })
        }
    });
});

postRouter.get('/get/:postId', (req, res) => {
    PostModel.findById(req.params.postId)
        .populate('author', 'email fullName avaUrl address dateOfBirth city country phoneNumber message favourite')
        .exec((error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                })
            } else {
                res.status(200).json({
                    success: true,
                    data: data,
                })
            }

        });
});

postRouter.get('/render', (req, res) => {
    var renderArray = {};
    let i = 0;
    PostModel.find({})
        .populate('author', 'email fullName avaUrl address dateOfBirth city country phoneNumber message favourite')

        .exec((error, data) => {
            data.forEach((post) => {
                renderArray[i] = post;
                i++;
            })
            res.status(201).json({
                success: true,
                data: renderArray,
                length: i,
            });
        })
});

postRouter.get('/comment/:id', (req, res) => {
    CommentModel.find({ post: req.params.id })
        .populate('author', 'fullName avaUrl')
        .sort({
            createdAt: 1,
        })
        .exec((error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                })
            } else {
                CommentModel.find({ post: req.params.id }).countDocuments().exec((error, total) => {
                    if (error) {
                        res.status(500).json({
                            success: false,
                            message: error.message,
                        })
                    } else {
                        PostModel.findOneAndUpdate({ _id: req.params.id }, { comment: total }, (error, data2) => {
                            if (error) {
                                res.status(500).json({
                                    success: false,
                                    message: error.message,
                                })
                            } else {
                                res.status(200).json({
                                    success: true,
                                    data: data,
                                    total: total,
                                })
                            }
                        });
                    }
                });

            }

        })

})

postRouter.post('/comment/:id', (req, res) => {
    console.log('here');
    if (req.session.currentUser && req.session.currentUser.id) {
        const newComment = {
            post: req.params.id,
            content: req.body.content,
            author: req.session.currentUser.id,
            createdAt: new Date()
        }
        CommentModel.create(newComment, (error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                })
            } else {
                res.status(201).json({
                    success: true,
                    data: data,
                })
            }
        });

    } else {
        res.status(403).json({
            success: false,
            message: 'Unauthenticated',
        })
    }
});

postRouter.post('/search-by-post', (req, res) => {
    const { title } = req.body;
    console.log(title);
    PostModel.find({ title: { $regex: title, $options: 'i' } }, (error, data) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        }
        else if (!data) {
            res.status(501).json({
                success: false,
                message: "no post was found"
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


postRouter.get('/id/', (req, res) => {
    const pageNumber = Number(req.query.pageNumber);
    const pageSize = Number(req.query.pageSize);

    //validate
    if (isNaN(pageNumber) || isNaN(pageSize)) {
        res.status(500).json({
            success: false,
            message: 'pageNumber && pageSize is invalid',
        })
    }
    if (pageNumber < 1 || pageSize < 1 || pageSize > 40) {
        res.status(500).json({
            success: false,
            message: 'pageNumber && pageSize is invalid',
        })
    }


    PostModel.find({ author: req.query.id })
        .populate('author', 'email fullName avaUrl address dateOfBirth city country phoneNumber message favourite')
        .sort({
            createdAt: -1,
        })
        .skip(pageSize * (pageNumber - 1))
        .limit(pageSize)
        .exec((error, data) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: 'pageNumber && pageSize is invalid',
                })
            } else {
                PostModel.find({ author: req.query.id }).countDocuments().exec((error, total) => {
                    if (error) {
                        res.status(500).json({
                            success: false,
                            message: 'pageNumber && pageSize is invalid',
                        })
                    } else {
                        res.status(200).json({
                            success: true,
                            data: data,
                            total: total,
                        })
                    }
                });

            }

        })

})



postRouter.get('/', (req, res) => {
    const pageNumber = Number(req.query.pageNumber);
    const pageSize = Number(req.query.pageSize);

    //validate
    if (isNaN(pageNumber) || isNaN(pageSize)) {
        res.status(500).json({
            success: false,
            message: 'pageNumber && pageSize is invalid',
        })
    }
    if (pageNumber < 1 || pageSize < 1 || pageSize > 40) {
        res.status(500).json({
            success: false,
            message: 'pageNumber && pageSize is invalid',
        })
    }

    if (req.query.categories === 'all' && req.query.color === 'all') {
        //queries db
        PostModel.find({})
            .populate('author', 'email fullName avaUrl address dateOfBirth city country phoneNumber message favourite')

            .sort({
                createdAt: -1,
            })
            .skip(pageSize * (pageNumber - 1))
            .limit(pageSize)
            .exec((error, data) => {
                if (error) {
                    res.status(500).json({
                        success: false,
                        message: 'pageNumber && pageSize is invalid',
                    })
                } else {
                    PostModel.find({}).countDocuments().exec((error, total) => {
                        if (error) {
                            res.status(500).json({
                                success: false,
                                message: 'pageNumber && pageSize is invalid',
                            })
                        } else {
                            res.status(200).json({
                                success: true,
                                data: data,
                                total: total,
                            })
                        }
                    });

                }

            })
    } else if (req.query.color === 'all' && req.query.categories != 'all') {
        console.log(req.query.categories);
        PostModel.find({ categories: req.query.categories })
            .populate('author', 'email fullName avaUrl address dateOfBirth city country phoneNumber message favourite ')

            .sort({
                createdAt: -1,
            })
            .skip(pageSize * (pageNumber - 1))
            .limit(pageSize)
            .exec((error, data) => {
                if (error) {
                    res.status(500).json({
                        success: false,
                        message: 'pageNumber && pageSize is invalid',
                    })
                } else {
                    PostModel.find({ categories: req.query.categories }).countDocuments().exec((error, total) => {
                        if (error) {
                            res.status(500).json({
                                success: false,
                                message: 'pageNumber && pageSize is invalid',
                            })
                        } else {
                            res.status(200).json({
                                success: true,
                                data: data,
                                total: total,
                            })
                        }
                    });

                }

            })
    } else if (req.query.color != 'all' && req.query.categories === 'all') {
        PostModel.find({ mainColor: req.query.color })
            .populate('author', 'email fullName avaUrl address dateOfBirth city country phoneNumber message favourite')

            .sort({
                createdAt: -1,
            })
            .skip(pageSize * (pageNumber - 1))
            .limit(pageSize)
            .exec((error, data) => {
                if (error) {
                    res.status(500).json({
                        success: false,
                        message: 'pageNumber && pageSize is invalid',
                    })
                } else {
                    PostModel.find({ mainColor: req.query.color }).countDocuments().exec((error, total) => {
                        if (error) {
                            res.status(500).json({
                                success: false,
                                message: 'pageNumber && pageSize is invalid',
                            })
                        } else {
                            res.status(200).json({
                                success: true,
                                data: data,
                                total: total,
                            })
                        }
                    });

                }

            })
    } else {
        PostModel.find({ mainColor: req.query.color, categories: req.query.categories })
            .populate('author', 'email fullName avaUrl address dateOfBirth city country phoneNumber message favourite')

            .sort({
                createdAt: -1,
            })
            .skip(pageSize * (pageNumber - 1))
            .limit(pageSize)
            .exec((error, data) => {
                if (error) {
                    res.status(500).json({
                        success: false,
                        message: 'pageNumber && pageSize is invalid',
                    })
                } else {
                    PostModel.find({ mainColor: req.query.color, categories: req.query.categories }).countDocuments().exec((error, total) => {
                        if (error) {
                            res.status(500).json({
                                success: false,
                                message: 'pageNumber && pageSize is invalid',
                            })
                        } else {
                            res.status(200).json({
                                success: true,
                                data: data,
                                total: total,
                            })
                        }
                    });

                }

            })
    }
})



module.exports = postRouter;