const express = require('express');
const router = express.Router();
const passwordvalidation = require('../middleware/passwordvalidation')
const userCtrl = require('../controllers/user');


router.post('/signup',passwordvalidation,userCtrl.signup);
router.post('/login',userCtrl.login);

module.exports = router;