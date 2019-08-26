const express = require('express');
const multer = require('multer');
const fs= require('fs');
var path = require('path');


const uploadRouter = express.Router();
const upload = multer({
    dest: 'public'
});


module.exports = uploadRouter;