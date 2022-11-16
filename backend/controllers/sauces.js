//for the model for mongo
const Sauce = require("../models/Sauce");
//filesystem routing function
const fs = require("fs");
const { error } = require("console");
//----------------------------------------------------------------------------------
//  method getAllSauce
//----------------------------------------------------------------------------------
//  access to all sauces 
// user with valid webtoken will be able to access info and only if token is identified for access
exports.getAllSauce = (req, res, next) => {
  // for the all sauce list use find() without argument
  Sauce.find()
    //  then list sauces and http ref 200 in json 
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    // if erreur  the http reference is 400 Bad Request and an error in json 
    .catch((error) => res.status(400).json({ error }));
};
//----------------------------------------------------------------------------------
// method  getOneSauce
//----------------------------------------------------------------------------------
// access to one sauce
// user with correct webtokenvalide  will accesss to the infor
exports.getOneSauce = (req, res, next) => {
  // using the model mongoose and method findone  to find object  with the comparsion of req.params.id
  Sauce.findOne({ _id: req.params.id })
    // status 200 ok and a json file
    .then((sauce) => res.status(200).json(sauce))
    // erreur sent as status 404 Not Found with a json error 
    .catch((error) => res.status(404).json({ error }));
};
//----------------------------------------------------------------------------------
// method createSauce
//----------------------------------------------------------------------------------
// create a sauce 
exports.createSauce = (req, res, next) => {
  // extract the sauce via a json parse 
  // in the  req.body.sauce the sauce 
  const sauceObject = JSON.parse(req.body.sauce);
  // will serve up permeters 
  const addVoting = {
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  };
  // the user id for the search must be the same as the id associated with the token. 
  if (sauceObject.userId !== req.auth.userId) {
    // reponse status 403 Forbidden avec message json
    return res.status(403).json("unauthorized request");
    // make sure file is an image  -can restrict filetypes to 3
  } else if (
    req.file.mimetype === "image/jpeg" ||
    req.file.mimetype === "image/png" ||
    req.file.mimetype === "image/jpg" 
  ) {
    // declare a sauce with has a new instance which has all forms filled with are required. 
    const sauce = new Sauce({
      // this is the shorrtcut which will get all data in  req.body ( title description...)
      ...sauceObject,
      // the image url will need protocole with :// then the port (host) which is in the folder images with filename
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
      ...addVoting,
    });
    // shortcut addVoting adds the model attributes for heat as not present on creation then add values 
    if (sauce.heat < 0 || sauce.heat > 10) {
      sauce.heat = 0;
      console.log(" heat  value not valid, heat values  zero");
    }
    // save object in the database
    sauce
      .save()
      // returns a promise, but must return a response, status  201    and a json message that post saved
      .then(() =>
        res
          .status(201)
          .json({ message: "POST recorded sauce !" })
      )
      // or in case of error send a status 400 and json error
      .catch((error) => res.status(400).json({ error }));
    // if the file is not a image  ce qui est envoyé n'est pas un fichier image
  } else {
    // déclare the sauce which will be a new instance and has all info necessary  of the creation of a sauce for all info required 
    const sauce = new Sauce({
      // short cut to get all the data from req.body (name, description..)
      ...sauceObject,
      // add image by default
      // the image url which has protocol :// port (host) folder images and filename imagedefault
      imageUrl: `${req.protocol}://${req.get(
        "host"
      )}/images/default/imagedefault.png`,
      ...addVoting,
    });
    // and again need to add heat value
    if (sauce.heat < 0 || sauce.heat > 10) {
      sauce.heat = 0;
      console.log("heat value not valid, heat values added");
    }
    // save data
    sauce
      .save()
      // this returns a promise and give status 201 OK for the creation of a source and json message
      .then(() =>
        res
          .status(201)
          .json({ message: "POST sauce recorded !" })
      )
      // in case of erreur send a status 400 Bad Request et json error
      .catch((error) => res.status(400).json({ error }));
  }
};
//----------------------------------------------------------------------------------
// method modifySauce 
//----------------------------------------------------------------------------------
// change a sauce
exports.modifySauce = (req, res, next) => {
  // id of the sauce which is in the URL
  Sauce.findOne({ _id: req.params.id })
    // if the sauce exists
    .then((sauce) => {
      // this variable permits to reduce the code de traverser le scope
      var sauceBot;
      //this const is the  value of  heat of the sauce before modification, used if the new heat is a value that is not accepted
      const heatAvant = sauce.heat;
      // the user will be who has a valid token
      const immuable = {
        userId: req.auth.userId,
        likes: sauce.likes,
        dislikes: sauce.dislikes,
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked,
      };
      // the user id of the sauce creator must be the id as the modifer
      if (sauce.userId !== req.auth.userId) {
        //  if not a match the respond with  status 403 Forbidden  json message unauthorised
        return res.status(403).json("unauthorised request");
        // if there is a file with the modification demand
      } else if (req.file) {
        // verify it is an image file allowed - limited to 3 types 
        if (
          req.file.mimetype === "image/jpeg" ||
          req.file.mimetype === "image/png" ||
          req.file.mimetype === "image/jpg" 
        ) {
          // to get file name 
          const filename = sauce.imageUrl.split("/images/")[1];
          // or for default image  
          const testImage = 'default/imagedefault.png';
          // if the filename is not default image
          if(testImage != filename){
          // delete the image file and replace
          fs.unlink(`images/${filename}`, () => {});
          }
          // extract the sauce search with parse
          // in  req.body.sauce the  sauce correspones to a key add info
          const sauceObject = {
            ...JSON.parse(req.body.sauce),
            // add image with newfile name 
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
            ...immuable,
          };
          sauceBot = sauceObject;
          // if the file is not a image
        } else {
          // determine the filename of old image
          const filename = sauce.imageUrl.split("/images/")[1];
          // si  the file is default image name
          const testImage = 'default/imagedefault.png';
          // if the filename is not default image
          if(testImage != filename){
          // delete file and replace
          fs.unlink(`images/${filename}`, () => {});
          }
          // recuporate with the  parse req.body.sauce  and et add the new image
          // in the req.body.sauce the sauce corresponds to a  key and  info
          const sauceObject = {
            ...JSON.parse(req.body.sauce),
            // image willbe image by  default
            imageUrl: `${req.protocol}://${req.get(
              "host"
            )}/images/default/imagedefault.png`,
            ...immuable,
          };
          sauceBot = sauceObject;
        }
        // if there is not a file with  modification request (ps: keeps first image when created)
      } else {
        // since there is no image file the image seach will be by default the old image 
        req.body.imageUrl = sauce.imageUrl;
        // the sauce will be the search 
        const sauceObject = {
          ...req.body,
          ...immuable,
        };
        sauceBot = sauceObject;
      }
      // if there is an issue with heat value, the value stays at the same level as before search
      if (sauceBot.heat < 0 || sauceBot.heat > 10) {
        sauceBot.heat = heatAvant;
        console.log("heat value is not valid, old vlaue is retained");
      }
      //  to modify a sauce in the database, the first argument is the object ro modify  which corresponds to object id and the id of search 
      // the second argument is the new version the objet which contains the sauce which has in the body id of search and _id and its params
      Sauce.updateOne(
        { _id: req.params.id },
        { ...sauceBot, _id: req.params.id }
      )
        // returns a promise with status 201 and json message
        .then(() =>
          res
            .status(201)
            .json({ message: "modified sauce !" })
        )
        // in case of an error  status 400 Bad Request and a json error
        .catch((error) => res.status(400).json({ error }));
    })
    // in case of erreur
    .catch((error) => {
      // if there is a file with search
      if (req.file) {
        // the file of the search which was created by multer will be deleted using fs.unlink
        fs.unlink(`images/${req.file.filename}`, () => {});
      }
      // error  404 Not Found and json error 
      res.status(404).json({ error });
    });
};
//----------------------------------------------------------------------------------
// method DeleteSauce 
//----------------------------------------------------------------------------------
// delete a sauce 
exports.deleteSauce = (req, res, next) => {
  // find a sauce  un _id corresponds with id of search 
  Sauce.findOne({ _id: req.params.id })
    // if a sauce is found
    .then((sauce) => {
      //const nomimage of the  sauce found 
      const nomImage = sauce.imageUrl;
      // const of the default image
      const imDefault = "http://localhost:3000/images/default/imagedefault.png";
      // id of the creator  needs to be same and user deleting
      if (sauce.userId !== req.auth.userId) {
        // if not then status 403 Forbidden with message json
        return res.status(403).json("unauthorized request");
        // and if the image is not default then
      } else if (nomImage != imDefault) {
        // creat a table via url and a separate part for /images  and then get index 1 which is the filename
        const filename = sauce.imageUrl.split("/images/")[1];
        // unlink deletes the image file from image directory
        fs.unlink(`images/${filename}`, () => {
          // deletes a sauce and its id 
          Sauce.deleteOne({ _id: req.params.id })
            // returns a promise status 200ok et gives json message
            .then(() =>
              res
                .status(200)
                .json({ message: "sauce removed !" })
            )
            // if  erreur status 400  Bad Request  and json erreur 
            .catch((error) => res.status(400).json({ error }));
        });
        // the image file is default
      } else {
        // delete a sauce amd id and _id will be compared with the id in the search request 
        Sauce.deleteOne({ _id: req.params.id })
          // returns a promise status 200 OK and message json
          .then(() =>
            res
              .status(200)
              .json({ message: "sauce removed !" })
          )
          // if erreur status 400 Bad Request and  erreur json
          .catch((error) => res.status(400).json({ error }));
      }
    })
    // erreur 404 Not Found with json  erreur
    .catch((error) => res.status(404).json({ error }));
};
//----------------------------------------------------------------------------------
// method likeSauce
//----------------------------------------------------------------------------------
// like a sauce
exports.likeSauce = (req, res, next) => {
  //using  l mangoose  model and method findOne to find a   object via  req.params.id
  Sauce.findOne({ _id: req.params.id })
    //returns a promise with  status 200 OK and json 
    .then((sauce) => {
      // définition of  diverse variables
      let voteValue;
      let voter = req.body.userId;
      let like = sauce.usersLiked;
      let unlike = sauce.usersDisliked;
      // determine if user is in the user table 
      let good = like.includes(voter);
      let bad = unlike.includes(voter);
      // this comparator method will attribrute a value to a table. 

      if (good === true) {
        voteValue = 1;
      } else if (bad === true) {
        voteValue = -1;
      } else {
        voteValue = 0;
      }
      // this comparator will determin the vote of user with a vote action 
      // if the user has yet to vote the default will be positive.
      if (voteValue === 0 && req.body.like === 1) {
        // add vote positive to likes
        sauce.likes += 1;
        // the table  usersLiked contains id  and user id
        sauce.usersLiked.push(voter);
        // if user user have voted but want to annuler
      } else if (voteValue === 1 && req.body.like === 0) {
        // take of  1 vote positive
        sauce.likes -= 1;
        // filter and take of vote id of the table usersliked
        const newUsersLiked = like.filter((f) => f != voter);
        // update table
        sauce.usersLiked = newUsersLiked;
        // if user has voted negative and want to change vote
      } else if (voteValue === -1 && req.body.like === 0) {
        // take off one negative vote 
        sauce.dislikes -= 1;
        // filter id of  voter table usersDisliked
        const newUsersDisliked = unlike.filter((f) => f != voter);
        // update table 
        sauce.usersDisliked = newUsersDisliked;
        // if user has not voted before and votes negative 
      } else if (voteValue === 0 && req.body.like === -1) {
        // add one vote to dislikes 
        sauce.dislikes += 1;
        // the table usersDisliked will receive user id
        sauce.usersDisliked.push(voter);
        // for all other scenarios , not coming with index  then error message of illegal action 
      } else {
        const message = console.log("vote attempt is illegal");
      }
      // update the sauce
      Sauce.updateOne(
        { _id: req.params.id },
        {
          likes: sauce.likes,
          dislikes: sauce.dislikes,
          usersLiked: sauce.usersLiked,
          usersDisliked: sauce.usersDisliked,
        }
      )
        // return a promise with status 201 Created and json  message
        .then(() => res.status(201).json({ message: "you have voted" }))
        // in case of errers  status 400 and  json error
        .catch((error) => {
          if (error) {
            console.log("error");
          }
        });
    })
    //this is the 404 error if not found 
    .catch((error) => res.status(404).json({ error }));
};