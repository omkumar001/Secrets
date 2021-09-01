//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
// const encrypt=require("mongoose-encryption");
//const md5=require("md5");

// const bcrypt=require("bcrypt");
// const saltRounds=10;

const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const findOrCreate = require('mongoose-findorcreate')

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
  
 secret:"our home",
 resave:false,
 saveUninitialized:true,

}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});

//mongoose.set("useCreateIndex",true);

//console.log(process.env.SECRET);

const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
    secret:String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


//userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

const  User=new mongoose.model("User",userSchema);


//for the passport cookies and the sessions
passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID:     process.env.CLIENT_ID,
    clientSecret:  process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
      
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
        
      return done(err, user);
    });
  }
));






app.get("/", function (req, res) {
    res.render("home");
});


app.get("/auth/google", passport.authenticate("google", { scope: [  "profile" ] }));

app.get( "/auth/google/secrets", passport.authenticate( "google", {
        successRedirect: "/secrets",
        failureRedirect: "/login"
}));



app.get("/login", function (req, res) {
    res.render("login",{status:"true"});
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/logout", function (req, res) {
    res.redirect("/");
 });

 



app.post("/", function (req, res) {

});

app.get("/secrets",function(req,res){
   
//    if(req.isAuthenticated())
//    res.render("secrets");
//    else
//    res.redirect("/login");

User.find({"secret":{$ne: null}},function(err,foundSecret){
    if(err)
    console.log(err);
    else{
        if(foundSecret){
        
        res.render("secrets",{userwithSecrets:foundSecret});
        }
    }
});

});


app.get("/submit", function (req, res) {

    if(req.isAuthenticated())
    res.render("submit");
   else
   res.redirect("/login");


   
 });






app.post("/register", function (req, res) {


  User.register({username:req.body.username},req.body.password,function(err,user){

    if(err)
    {
        console.log(err);
        res.redirect("/register");
    }
    else{
        passport.authenticate("local") (req,res,function(){
            res.redirect("/secrets");
        });
    }

  });




    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.

    //     const email=req.body.username;
    //     const pass=hash;
    //    // md5(req.body.password)
    
    //     const newUser=new User({
    //        email:email,
    //        password:pass,
    //     });
    
    //     newUser.save(function(err){
    
    //        if(err)
    //        console.log(err);
    //        else
    //        res.render("secrets");
    //     });
        
    // });
     
 
    // // res.redirect("/");

});


app.post("/login", function (req, res) {
 

    const user=new User({
               username:req.body.username,
               password:req.body.password,
            });
    
    req.login(user,function(err){

        if(err)
        console.log(err);
        else{
            passport.authenticate("local") (req,res,function(){
                res.redirect("/secrets");
            }); 
        }

    });

// const username=req.body.username;
// const pass=req.body.password
// //md5(req.body.password);

// User.findOne({email:username},function(err,foundUser){
     
//     if(err)
//     console.log(err);
//     else{
//         if(foundUser){
//             bcrypt.compare(pass,foundUser.password, function(err, result) {
//                 // result == true

//                 if(result){
//                     res.render("secrets");
//                    }
//               });
//            }
//            else
//            {     
//                res.render("login",{status:"false",message:"Invalid Login Credentials !!"});
//                console.log("User Not Found");
//            }
       
//         }
//      });
});



app.post("/submit", function (req, res) {
    
    const Submittedsecret=req.body.secret;
    console.log(req.user.id);

    User.findById(req.user.id,function(err,foundUser){

        if(err)
        console.log(err);
        else{
            if(foundUser){

                foundUser.secret=Submittedsecret;
                foundUser.save();
                res.redirect("/secrets");
            }
        }

    });

  
});








app.listen(3000, function () {
  console.log("Server started at the port 3000.");
});
