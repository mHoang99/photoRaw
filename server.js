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
