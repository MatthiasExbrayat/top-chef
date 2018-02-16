var michelin = require("./michelin");
var lafourchette = require("./lafourchette");
var jsonfile = require('jsonfile');

//We need to execute each stage one after one.

/*1 - Getting the starred restaurants list of michelin*/
//restaurantsList = michelin.getRestaurants();

/*2 - Getting the starred restaurants list founded on lafourchette*/
/*jsonfile.readFile('michelin_restaurants_list.json', function(err, restaurants){
  lafourchette.searchAllRestaurants(restaurants);
});*/

/*3 - Getting the starred restaurants deals list founded on lafourchette*/
jsonfile.readFile('lafourchette_restaurants_list.json', function(err, restaurants){
  lafourchette.getAllRestaurantDeals(restaurants);
});
