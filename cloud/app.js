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


//------------------------------AUTHENTICATION----------------------------------

// LogIn
app.post('/login', function(req, res) {
  Parse.User.logIn(req.body.username, req.body.password).then(function() { res.redirect('/'); },
  function(error) { res.redirect('/'); });
});

//SignUp
app.post('/signup', function(req, res){

  var user = new Parse.User();
  user.set("username", req.body.username);
  user.set("password", req.body.password);

  user.signUp(null, {
    success: function(user) { res.redirect('/'); },
    error: function(user, error) { res.redirect('/'); }
  });
});

//Logout
app.get('/logout', function(req, res) { Parse.User.logOut(); res.redirect('/'); });

//------------------------------------------------------------------------------



//-------------------------------Top Bar ---------------------------------------

//About pages
//Adam did this, hes pretty drunk, might want to double check
app.get('/about', function(req, res) {
    res.render('about');
});

app.get('/about-lauren', function(req, res) {
  res.render('about-lauren');
});

app.get('/about-chening', function(req,res) {
  res.render('about-chening');
});

app.get('/about-adam', function(req,res) {
  res.render('about-adam');
});


//------------------------------------------------------------------------------

//Root
app.get('/', function(req, res) {
  if (Parse.User.current()) { res.redirect('home-dash'); }
  else { res.render('login'); }
});



//--------------------------------------------------------------

app.get('/clear_balance', function(req, res) {
	res.render('clear_balance');
});

app.get('/house_nav', function(req, res) {
	res.render('house_nav');
});





//--------------------------Home Creation-------------------------------------
//Homes look like this:

//Class = Homes
//Instance = ObjectId: XXXX, user: {userName: XXX, balance: 444 }
////It is worth noting username is used as a unique id

var Homes = Parse.Object.extend("Homes");

//Home Dashboard
app.get('/home-dash', function(req, res) {

  var me;
  var homes;
  Parse.User.current().fetch().then(function(_me){ me = _me.get('username');}.bind(this)).then(function(){
    var query = new Parse.Query(Homes);
    query.find().then(function(result){
      homes = result;
    }.bind(this)).then(function(){
      res.render('home-dash', { homes: homes, me: me });
    }.bind(this));
  }.bind(this));

});

//Create a home
app.post('/createHome', function(req, res){
  var user = {userName: '', balance: 0};
  var home = new Homes();
  home.set('name', req.body.name);
  home.save();

  Parse.User.current().fetch().then(function(_me){
    user.userName = _me.get('username');
    user.balance = 0;
  }.bind(this)).then(function(){
    home.set('user', [user] );
    home.save();
    res.redirect('home-dash');
  }.bind(this));
});



//Update a home
app.post('/updateHome', function(req, res){
  var user = req.body.home.user;
  var id = req.body.home.ObjectId;
  var query = new Parse.Query(Homes);
  query.include('user');
  query.get(id).then(function(home){
    home.set('user', [user] );
    home.save();
    res.redirect('home-dash');
  });
});

// Add user to home
app.post('/addUser', function(req, res){
  var user = {userName: req.body.userName, balance: 0};
  var query = new Parse.Query(Homes);
  query.equalTo('objectId', req.body.homeId);
  query.first().then(function(home){
    home.addUnique('user', user);
    home.save();
    res.redirect('home-dash');
  });
});

//----------------------------Home Navigation-----------------------------------

app.get('/home/:homeId', function(req, res) {
  var homeId = req.params.homeId;
  var me;
  //Copy-pasted grocery_list code to move it to front page
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
  },

  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }

	});
  Parse.User.current().fetch().then(function(_me){ me = _me.get('username');}.bind(this)).then(function(){
    var query = new Parse.Query(Homes);
    query.equalTo('objectId', homeId);
    query.first().then(function(_home){
       res.render('house_nav', { home: _home, me: me, groceryNames: groceryNames, groceryCosts: groceryCosts,
    	groceryNotes: groceryNotes, groceryIDs: groceryIDs });
    }.bind(this));
  }.bind(this));
}.bind(this));




//----------------------------VENMO & MONEY-------------------------------------

app.get('/clear_balance', function(req, res) {
  res.render('clear_balance');
});






//----------------------------GROCERIES----------------------------------------


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



// Make item name:
app.post('/make_item', function(req, res){

	// Define Grocery item:
	var Grocery = Parse.Object.extend("Grocery");

	var grocery = new Grocery();
	grocery.set("itemName", req.body.itemName);
	grocery.set("itemCost", req.body.itemCost);
	grocery.set("itemNotes", req.body.itemNotes);

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
