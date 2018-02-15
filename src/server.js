var michelin = require("./michelin");
var lafourchette = require("./lafourchette");
var jsonfile = require('jsonfile');

/*Getting the starred restaurants list of michelin*/
restaurantsList = michelin.getRestaurants();

/*Getting the starred restaurants list founded on lafourchette*/
/*jsonfile.readFile('michelin_restaurants_list.json', function(err, restaurants){
  //get all the current deals of the restaurants on LaFourchette and write a new JSON '4_restaurants_promotions_list.json'
  lafourchette.searchAll(restaurants);
});*/

/*Getting the starred restaurants deals list founded on lafourchette*/
