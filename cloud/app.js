
//initialize Express in Cloud Code
//Require cookie and redirect modules
var express = require('express');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
app.use(express.bodyParser()); // Middleware for reading request body
app.use(express.cookieParser('BarryWhiteChocolate'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));



//Home Page Route
// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/', function(req, res) {
  if (Parse.User.current()) {
      res.render('hello', { message: 'Logged in'); //Ask parse how to get usernam
  }
  else {
    res.render('login', { message: 'Log in here:' });
  }

});

// LogIn
app.post('/login', function(req, res) {
  Parse.User.logIn(req.body.username, req.body.password).then(function() {
    res.redirect('/');
  },
  function(error) {
    res.redirect('/');
  });
});


//SignUn
app.post('/signup', function(req, res){

  var user = new Parse.User();
  user.set("username", req.body.username);
  user.set("password", req.body.password);

  user.signUp(null, {
    success: function(user) {
      console.log('We just created a user', user);
    },
    error: function(user, error) {
        console.log("Error:" + error.code + " " + error.message);
    }
  });
  res.redirect('/');
});

//Logout
app.get('/logout', function(req, res) {
  Parse.User.logOut();
  res.redirect('/');
});

// Define Grocery item:
var Grocery = Parse.object.extend("Grocery");

// Make item name:
app.post('/make_item', function(req, res){
	var grocery = new Grocery();
	grocery.set("item_name", item-name);
	grocery.set("item_cost", item-cost);
	grocery.set("item_message", item-message);
	//name, price, notes, who's in?
	
});

// // Example reading from the request query string of an HTTP get request.
// app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });

// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

// Attach the Express app to Cloud Code.
app.listen();
