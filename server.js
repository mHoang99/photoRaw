const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const postRouter = require('./users/posts.router');
const userRouter = require('./users/users.router');
const uploadRouter = require('./uploads/uploads.router');
const session = require('express-session');
const cors = require('cors');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AaU8tQfmz1_MFDTKuf84yYERXvdDt2ZFJVrxhNW_49DazF4A_F0VBuKyV5_nntyEdZqUa5Oq9ZBj65GV',
    'client_secret': 'EAZ8aFDU4lHHLy1bQqULYWqznf3dBknXZW3AH__zFC0bUs8AGUyR6RNbm-jHvqtikX7PsSqMO5vxuvKm'
});






mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb://localhost:27017/photoRaw', { useNewUrlParser: true }, (error) => {
    if (error) {
        throw error;
    } else {
        console.log('Connect to MongoDB success');

        const app = express();

        app.use(
            cors({
                origin: "http://localhost:3000",
                credentials: true,
                allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept",
            })
        );

        app.use(express.static('public'));

        app.use(session({
            secret: 'keyboard cat',
        }));

        app.set('view engine', 'ejs');



        app.post('/pay', (req, res) => {
            console.log(req);
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
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": "25",
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": "25"
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
                            res.redirect(payment.links[i].href);
                        }
                    }
                }
            });

        });

        app.get('/success', (req, res) => {
            const payerId = req.query.PayerID;
            const paymentId = req.query.paymentId;

            const execute_payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": "25.00"
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

        app.get('/cancel', (req, res) => res.send('Cancelled'));
        // router
        app.use(bodyParser.json());
        app.use('/users', userRouter);
        app.use('/posts', postRouter);
        app.use('/upload', uploadRouter);
        app.get('/', (req, res) => res.render('index'));

        //start server
        app.listen(3001, (err) => {
            if (err) {
                throw err;
            }
            console.log('Server listen on port 3001 ...');
        });
    }
});
