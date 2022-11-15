const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passwordSchema = require("../models/Password");
const validator = require("validator");


exports.signup = (req, res, next) => {
    // get data
    const validEmail = validator.isEmail(req.body.email);
    // valid email against email validator 
    const validPassword = passwordSchema.validate(req.body.password);
    // validate password against password reqs
    if (validEmail === true && validPassword === true) {
      // when both true send to crypt and hash 
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
        .then(() => res.status(201).json({ message: 'User added successfully!'}))
        .catch((error) => res.status(400).json({error: error}));
          })
        .catch((error) => res.status(500).json({error: error}));
  } else{ 
    console.log("Email or password not conform");
  // information au cas le mot de passe serait invalide
  console.log(
    "(invalid chararactors ) missing a password: " +
      passwordSchema.validate(req.body.password, { list: true })
  );
}
};

  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }).then(
      (user) => {
        if (!user) {
          return res.status(401).json({
            error: new Error('User not found!')
          });
        }
        bcrypt.compare(req.body.password, user.password).then(
          (valid) => {
            if (!valid) {
              return res.status(401).json({
                error: new Error('Incorrect password!')
              });
            }
            const token = jwt.sign({ userId: user._id },'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' });
            res.status(200).json({
              userId: user._id,
              token: token
            });
          }
        ).catch(
          (error) => {
            res.status(500).json({
              error: error
            });
          }
        );
      }
    ).catch(
      (error) => {
        res.status(500).json({
          error: error
        });
      }
    );
  }