var express = require('express');
var app = express();
var PORT = process.env.port || 3000;
var ejs = require('ejs');
var _ = require('underscore');
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var createImage = require('./createImage');


var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var user = {};

//passport oauth config
passport.use(new TwitterStrategy({
		consumerKey:'kPCtmc1qbLH024oeMArTjs2hU',
		consumerSecret:'vgIuKTfvDPkKdyzT2AvLbuvn6UDmdjMstAZUHXKayN8RfBu4aQ'
		// callbackURL:"http://localhost:3000/authn/twitter/callback"
	},function(token,tokenSecret,profile,done){
		user.token = token;
		user.tokenSecret = tokenSecret;
		user.profile = profile;
		done(null,user);
	})
);

//middlewares
app.use('/static',express.static(__dirname + '/static'));
app.use(cookieParser('secret'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({secret:"secret",resave:false,saveUninitialized: true}))
app.use(passport.initialize());
app.use(passport.session());

//passport user serialization
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.set('views',__dirname + '/views');
app.set('view engine','ejs');

app.get('/',function(req,res){
  console.log(req);
	res.render('index',{})
})

app.post('/render',upload.single('image'),function(req,res){
	var tmp_path = req.file.path;
  	var target_path = 'static/uploads/' + req.file.originalname;
  	var src = fs.createReadStream(tmp_path);
  	var dest = fs.createWriteStream(target_path);

  	var text = req.body.text.toUpperCase().substring(0,10) || "IMAGEBOT"
  	src.pipe(dest);
  	src.on('end',function(){
  		fs.unlinkSync(tmp_path);
  		createImage.addText(target_path,text).then(function(name){
  			console.log(name);
  			res.render('done',{
  				filename:name
  			})
  		},function(err){
  			res.render('err',{
  				err:err
  			})
  		})  		
  	})
});

app.get('/login',function(req,res,err){
  console.log(req);
  res.send('log in please')
})

//twitter oauth
app.get('/authn/twitter',passport.authenticate('twitter'));
app.get('/auth/twitter/callback',passport.authenticate('twitter',{successRedirect:'/',failureRedirect:'/login'}))

app.listen(PORT);
console.log('app listening at port: ' + PORT)
