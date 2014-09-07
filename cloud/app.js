
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
  var homeID = [];
  var homeUsers = [];
  var user = Parse.User.current();
  var myUsername;
  var Home = Parse.Object.extend("Home");
  //Create a query
  var query = new Parse.Query(Home);

  //Put conditions on it
  user.fetch().then(function(user) {
    myUsername = user.get('username');

  }).then(function() {
    //retrieve an Array of matching Parse.Objects using find
    query.find({
      success: function(results) {
        // Do something with the returned Parse.Object values
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          homeNames.push( object.get('name') );
          homeID.push( object.id );
          homeUsers.push( object.get('users') );
        }
        var usernames = [];
        for(var i = 0; i < homeUsers.length; i++){
        var queryName = new Parse.Query(Parse.User);
        queryName.equalTo( "objectId", homeUsers[i] );
        queryName.first().then(function(user){ usernames.push(user.get('username'));});
        }
        res.render('home-dash', {
          homeNames: homeNames,
          homeID: homeID,
          homeUsers: homeUsers,
          myUsername: myUsername,
          usernames: usernames
          });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });

  });
});

//About pages
//Adam did this, hes pretty drunk, might want to double check
app.get('/about', function(req, res) {
    res.render('about');
});

app.get('/about-Lauren', function(req, res) {
	res.render('about-Lauren');
});

app.get('/about-Chening', function(req,res) {
	res.render('about-Chening');
});

app.get('/about-Adam', function(req,res) {
	res.render('about-Adam');
});


//Profile Nav Page
//Adam did this, hes pretty drunk, might want to double check
app.get('/profile', function(req, res) {
	var homeNames = [];
	var user_query = new Parse.Query(Parse.User);

	user_query.find({
		success: function(results) {
      alert("Successfully retrieved " + results.length + " homes.");
      for (var i = 0; i < results.length; i++) {
      	var object = results[i];
      	alert(object.id + '  ' + object.get('username'));
      }
      res.render('profile', {profiles: results});
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
});


//Home Nav Page
app.get('/house_nav', function(req, res){
    res.render('house_nav');
});

//
app.get('/about_adam', function(req, res){

    res.render('about_adam');


});

app.get('/about_chening', function(req, res){

    res.render('about_chening');


});

//Grocery List Page
app.get('/grocery_list', function(req, res){
	var groceryNames = [];
	var groceryCosts = [];
	var groceryNotes = [];
//	var option1 = [];
//	var option2 = [];
//	var option3 = [];
	var groceryIDs = [];
	var Grocery = Parse.Object.extend("Grocery");
	var grocery_query = new Parse.Query(Grocery);

	grocery_query.find({
	  success: function(results) {
    alert("Successfully retrieved " + results.length + " groceries.");
    // Do something with the returned Parse.Object values
    for (var i = 0; i < results.length; i++) {
    	var object = results[i];
		groceryNames.push(object.get('itemName'));
		groceryCosts.push(object.get('itemCost'));
		groceryNotes.push(object.get('itemNotes'));
	//	option1.push(object.get('option1'));
	//	option2.push(object.get('option2'));
	//	option3.push(object.get('option3'));
		groceryIDs.push(object.id);
		
    	alert(object.id + ' - ' + object.get('item_name'));
    }
    res.render('grocery_list', {  
    	groceryNames: groceryNames,
    	groceryCosts: groceryCosts,
    	groceryNotes: groceryNotes,
    	groceryIDs: groceryIDs});
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
    home.set("users", [ Parse.User.current().id ] );

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
var Home = Parse.Object.extend("Home");

//Add user to home
app.post('/addUser', function(req, res){

  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.User); // Create a new query
  query.equalTo( 'username', req.body.username);
  query.first().then(function(user){

    var queryHome = new Parse.Query(Home);
    queryHome.equalTo( 'objectId', req.body.homeID);
    queryHome.first().then(function(home){
      home.add("users", user.id);
      return home.save();
    }).then(function(){ res.redirect('home-dash'); });

  });


});

// Make item name:
app.post('/make_item', function(req, res){

	// Define Grocery item:
	var Grocery = Parse.Object.extend("Grocery");

	var grocery = new Grocery();
	grocery.set("itemName", req.body.itemName);
	grocery.set("itemCost", req.body.itemCost);
	grocery.set("itemNotes", req.body.itemNotes);
//	grocery.set("option1", option1);
//	grocery.set("option2", option2);
//	grocery.set("option3", option3);


	grocery.save(null, {
		success: function(grocery) {
  		alert('New grocery created with objectId: ' + grocery.id);
      res.redirect('/grocery_list');
	  },
	  error: function(grocery, error) {
  	  alert('Failed to create new object, with error code: Chening!');
	  }
	//name, price, notes, who's in?
	});
});


app.post('/delete_item', function(req, res){
	var Grocery = Parse.Object.extend("Grocery");
	var grocery_query = new Parse.Query(Grocery);
	
	grocery_query.get( req.body.ident, {
		success: function(this_grocery){
			this_grocery.destroy({
				success: function(grocery_query){
					res.redirect('/grocery_list');
				},
				error: function(grocery_query, error){
				}
			});
		},	
		error: function(grocery_query, error) {
		alert('Nope, didnt work');
		}
	});
});


app.post('/adj_acnt', function(req, res){
	var Grocery = Parse.Object.extend("Grocery");
	var grocery_query = new Parse.Query(Grocery);
	
	grocery_query.get( req.body.claim, {
		success: function(this_grocery){
			var cost = this_grocery.get("itemCost");
			var members = this_grocery.get("itemMembers");
			for( int i = 0; i < members.length; i++) {
				var member_id = members[i]

				var User = Parse.Object.extend("User");
				var user_query = new Parse.Query(User);
				
				user_query.get( member_id, {
					success: function(this_user){
						var current_balance = this_user.get("balance");
						this_user.set("balance", current_balance - (cost / members.length) );
					},
					error: function(user_query, error){
					}
				});
			};
			
			this_grocery.destroy({
				success: function(grocery_query){
					res.redirect('/grocery_list');
				},
				error: function(grocery_query, error){
				}
			});
			
		},
		error: function(grocery_query, error){
		}
	});
});
		
	/*	
			this_grocery.destroy({
				success: function(grocery_query){
					res.redirect('/grocery_list');
				},
				error: function(grocery_query, error){
				}
			});
		},	
		error: function(grocery_query, error) {
		alert('Nope, didnt work');
		}
	});
});
*/

//function myFunction(ident){
//	var Grocery = Parse.Object.extend("Grocery");
//	var grocery_query = new Parse.Query(Grocery);
	
//	grocery_query(ident, {
//		success: grocery_query.destroy({
//			success: function(grocery_query){
//			},
//			error: function(grocery_query, error){
//			}
//			}),
//		error: function(grocery, error) {
//		alert('Nope, didnt work');
//		}
//});
//}


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
