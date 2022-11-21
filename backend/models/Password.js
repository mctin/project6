// on appelle password validator https://www.npmjs.com/package/password-validator
const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();
// le modèle du mot de passe
passwordSchema
.is().min(8)                                   
.is().max(20)                                  
.has().uppercase(1)                           
.has().lowercase()                              
.has().symbols(1)
.has().digits(1)                             
.has().not().spaces()                           

//validates if all requirements are met 

module.exports = passwordSchema;