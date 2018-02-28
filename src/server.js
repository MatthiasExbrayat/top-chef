var michelin = require("./michelin");
var lafourchette = require("./lafourchette");
var jsonfile = require('jsonfile');

//We need to execute each stage one after one by comment and uncomment each stage.

/*1 - Getting the starred restaurants urls list of michelin*/
//michelin.getUrlsOnMichelin();

/*2 - Getting the starred restaurants informations on michelin*/
/*jsonfile.readFile('michelin_restaurants_urls_list.json', function(err, restaurantsList){
  michelin.getRestaurantsInformationsOnMichelin(restaurantsList);
});*/

/*3 - Search the michelin starred restaurants which are on LaFourchette and get their id*/
jsonfile.readFile('michelin_restaurants_informations_list.json', function(err, restaurantsList){
  lafourchette.getAllRestaurantsIdOnLaFourchette(restaurantsList);
});
