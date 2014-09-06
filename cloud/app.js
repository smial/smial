
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
    res.redirect('/home-dash');
  }
  else {
    res.render('login', { message: 'Log in here:' });
  }

});

//Home Dashboard
app.get('/home-dash', function(req, res) {
  var homeNames = [];
  var homeIDs = [];
  var homeUsers = [];
  var Home = Parse.Object.extend("Home");
  //Create a query
  var query = new Parse.Query(Home);

  //Put conditions on it

  //retrieve an Array of matching Parse.Objects using find
  query.find({
    success: function(results) {
      alert("Successfully retrieved " + results );
      // Do something with the returned Parse.Object values
      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        homeNames.push( object.get('name') );
        homeIDs.push( object.id );
        homeUsers.push( object.get('users') );
      }
      res.render('home-dash', { homeNames: homeNames, homeIDs : homeIDs, homeUsers: homeUsers });
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
});

//Home Nav Page
app.get('/house_nav', function(req, res){
	var groceryList = [];
	var Grocery = Parse.Object.extend("Grocery");
	var grocery_query = new Parse.Query(Grocery);

	grocery_query.find({
	  success: function(results) {
    alert("Successfully retrieved " + results.length + " groceries.");
    // Do something with the returned Parse.Object values
    for (var i = 0; i < results.length; i++) {
      var object = results[i];
      alert(object.id + ' - ' + object.get('item_name'));
    }
    res.render('house_nav', {groceries: results});
  },
  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
});
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


//SignUp
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

//Create a home
app.post('/createHome', function(req, res){

  //Create a class called home
  var Home = Parse.Object.extend("Home");

  //Create an instance of a home & name it
  var home = new Home();
    home.set("name", req.body.nameHome );
    home.set("users", [] );

    home.save(null, {
    success: function(home) {
      // Execute any logic that should take place after the object is saved.
      alert('New object created with objectId: ' + home.id);
      res.redirect('/home-dash');
    },
    error: function(home, error) {
      alert('Failed to create new object, with error code: ' + error.message);
    }
  });
});
//Add user to home
app.post('/addUser', function(req, res){

  var User = Parse.Object.extend("User");
  var query = new Parse.Query(User); // Create a new query
  console.log(req.body.username, ' is the username...');
  query.equalTo("username", req.body.username); //Add Constraints
  //Find Matches
  query.find({
    success: function(userToAdd) {
      alert("Successfully retrieved " + userToAdd.length + " user to Adds.");
      var Home = Parse.Object.extend("Home");
      var query = new Parse.Query(Home);

      query.equalTo("id", req.body.homeID);
      query.find({
        success: function(home) {
          alert('found' + home.length + 'home: ' + JSON.stringify(home) );
          home.add("users", userToAdd);
          home.save();
          res.redirect('/home-dash');
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
});

// Make item name:
app.post('/make_item', function(req, res){

	// Define Grocery item:
	var Grocery = Parse.Object.extend("Grocery");

	var grocery = new Grocery();
	grocery.set("item_name", req.body.item-name);
	grocery.set("item_cost", req.body.item-cost);
	grocery.set("item_message", req.body.item-message);

	grocery.save(null, {
		success: function(grocery) {
		alert('New object created with objectId: ' + grocery.id);
	  },
	  error: function(grocery, error) {
	  alert('Failed to create new object, with error code: Chening!');
	  }
	  res.render('grocery_list');
	//name, price, notes, who's in?
	});
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
