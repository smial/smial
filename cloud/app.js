
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body


//Home Page Route
// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/', function(req, res) {
  res.render('login', { message: 'Log in here:' });
});

//The login route
app.post('/login', function(req, res){

  Parse.User.logIn(req.body.username, req.body.password, {
    success: function(user) {
      console.log("It was a success!!!");
    },
    error: function(user, error) {
      console.log("No user!!!", error);
    }
  });
  console.log(req.body.username);
  res.redirect('/');
});

//The signup route
app.post('/signup', function(req, res){

  var user = new Parse.User();
  user.set("username", req.body.username);
  user.set("password", req.body.password);

  user.signUp(null, {
    success: function(user) {
      console.log('We just created a user', user);
    },
    error: function(user, error) {
        alert("Error:" + error.code + " " + error.message);
        console.log("Error:" + error.code + " " + error.message);
    }
  });
  res.redirect('/');
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


// Check to see if user is logged in
// if (Parse.User.current()) {
//   new SmialView();
// } else {
//   new LogInView();
// }
