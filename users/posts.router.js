const express = require('express');
const PostModel = require('./posts.model');
postRouter = express.Router();

postRouter.post('/create', (req, res) => {
    //check login state
    console.log('here');

    if (req.session.currentUser && req.session.currentUser.id) {
        const newPost = {
            content: req.body.content,
            imageUrl: req.body.imageUrl,
            author: req.session.currentUser.id,
            price: req.body.price,
        }
        PostModel.create(newPost, (error, data) => {
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
        .populate('author', 'email fullName')
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
        .populate('author', 'email fullName')
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
    if (pageNumber < 1 || pageSize < 1 || pageSize > 20) {
        res.status(500).json({
            success: false,
            message: 'pageNumber && pageSize is invalid',
        })
    }

    //queries db
    PostModel.find({})
        .populate('author', 'email fullName')
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
})



module.exports = postRouter;