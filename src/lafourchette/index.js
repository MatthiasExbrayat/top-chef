var cheerio = require('cheerio');
var request = require('request');
var jsonfile = require('jsonfile');

var foundedRestaurants = 0;

//search the restaurant in lafourchette and get the id
function getRestaurantsID(restaurantsList, idx) {
  return new Promise(function(resolve, reject){
    var currentRestaurant = restaurantsList[idx];

    var restaurantUrl = 'https://m.lafourchette.com/api/restaurant-prediction?name=' + currentRestaurant.name.replace(/ /g, '_').replace(/&|°/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    console.log((idx+1) + ' : getting ID of ' + currentRestaurant.name + ' on ' + restaurantUrl);
    request(restaurantUrl, function(err, response, body){
      if(err){
        console.error(err);
        return reject(err);
      }

      var results = JSON.parse(body);
      results.forEach(function(returnedRestaurant){
        if(currentRestaurant.address.postalCode == returnedRestaurant.address.postal_code){
          currentRestaurant.id = returnedRestaurant.id;
          currentRestaurant.isOnLaFourchette = true;
          foundedRestaurants++;
        }
      });

      if(currentRestaurant.id == null){
        currentRestaurant.id = null;
        currentRestaurant.isOnLaFourchette = false;
      }
      setTimeout(function(){
        return resolve(restaurantsList)
      }, 100)
    });
  });
}

exports.getAllRestaurantsIdOnLaFourchette = function(restaurantsList){
  restaurantsList.reduce(function(prev, elt, idx, array){
    return prev.then(function(restaurantsList){
      return getRestaurantsID(array, idx);
    })
  }, Promise.resolve([]))
  .then(function(restaurantsList){
    jsonfile.writeFile('restaurants_list_withID.json', restaurantsList, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
      console.log('-----------------------');
      console.log('Json with LaFourchette IDs done');
      console.log("Number of restaurants founded on LaFourchette : " + foundedRestaurants);
    })
  })
}
