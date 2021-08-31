//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
// const encrypt=require("mongoose-encryption");
//const md5=require("md5");
const bcrypt=require("bcrypt");
const saltRounds=10;


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});


//console.log(process.env.SECRET);

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});


//userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

const  User=new mongoose.model("User",userSchema);



app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login",{status:"true"});
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/logout", function (req, res) {
    res.render("home");
 });

 app.get("/submit", function (req, res) {
    res.render("submit");
 });




app.post("/", function (req, res) {

});



app.post("/register", function (req, res) {


    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.

        const email=req.body.username;
        const pass=hash;
       // md5(req.body.password)
    
        const newUser=new User({
           email:email,
           password:pass,
        });
    
        newUser.save(function(err){
    
           if(err)
           console.log(err);
           else
           res.render("secrets");
        });
        
    });
     
 
    // res.redirect("/");

});


app.post("/login", function (req, res) {

const username=req.body.username;
const pass=req.body.password
//md5(req.body.password);

User.findOne({email:username},function(err,foundUser){
     
    if(err)
    console.log(err);
    else{
        if(foundUser){
            bcrypt.compare(pass,foundUser.password, function(err, result) {
                // result == true

                if(result){
                    res.render("secrets");
                   }
              });
           }
           else
           {     
               res.render("login",{status:"false",message:"Invalid Login Credentials !!"});
               console.log("User Not Found");
           }
       
        }
     });
});



app.post("/submit", function (req, res) {
    
    const secret=req.body.secret;
     res.render("secrets");
});








app.listen(3000, function () {
  console.log("Server started at the port 3000.");
});
