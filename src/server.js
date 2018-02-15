var michelin = require("./michelin");
var lafourchette = require("./lafourchette");
var jsonfile = require('jsonfile');

//restaurantsList = michelin.getRestaurants();
jsonfile.readFile('michelin_restaurants_list.json', function(err, restaurants){
  //get all the current deals of the restaurants on LaFourchette and write a new JSON '4_restaurants_promotions_list.json'
  lafourchette.getAllDeals(restaurants);
});
