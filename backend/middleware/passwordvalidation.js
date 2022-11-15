const passwordSchema = require("../models/Password");


// valid email against email validator 
module.exports = (req, res, next) => {
if (passwordSchema.validate(req.body.password)){
    next();

}else{
    return res
      .status(400)
      .json({
        message:
          "le mot de passe n'est pas conforme, il doit contenir entre 6 et 16 caractères,au moins 1 chiffre et 1 majuscule",
      });
}
};
