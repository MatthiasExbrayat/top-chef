var michelin = require("./michelin");
var lafourchette = require("./lafourchette");
var jsonfile = require('jsonfile');

//We need to execute each stage one after one by comment and uncomment each stage.

/*1 - Getting the starred restaurants urls list of michelin*/
//michelin.getURLsOnMichelin();

/*2 - Getting the starred restaurants informations on michelin*/
/*jsonfile.readFile('restaurants_list_with_michelinURL.json', function(err, restaurantsList){
  michelin.getRestaurantsInformationsOnMichelin(restaurantsList);
});*/

/*3 - Search the michelin starred restaurants which are on LaFourchette and get their id*/
/*jsonfile.readFile('restaurants_list_with_michelinInformations.json', function(err, restaurantsList){
  lafourchette.getAllRestaurantsIdOnLaFourchette(restaurantsList);
});*/

/*4 - Search Deals for each michelin starred restaurants which is on LaFourchette*/
jsonfile.readFile('restaurants_list_with_LaFourchetteIDs.json', function(err, restaurantsList){
  lafourchette.getAllRestaurantsDealsOnLaFourchette(restaurantsList);
});
