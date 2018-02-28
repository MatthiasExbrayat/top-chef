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
          currentRestaurant.lafourchetteUrl = 'https://www.lafourchette.com/restaurant/' + currentRestaurant.name.replace(/ /g, '-').replace(/--+/g, '-') + '/' + currentRestaurant.id;
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


function getRestaurantsDeals(restaurantsList, idx) {
  return new Promise(function(resolve, reject){
    var currentRestaurant = restaurantsList[idx];

    if(currentRestaurant.isOnLaFourchette){

      var restaurantUrl = 'https://m.lafourchette.com/api/restaurant/' + currentRestaurant.id + '/sale-type';
      console.log((idx+1) + ' : getting deals of ' + currentRestaurant.name + ' on ' + restaurantUrl);
      request(restaurantUrl, function(err, response, body){
        if(err){
          console.error(err);
          return reject(err);
        }

        var results = JSON.parse(body);
        currentRestaurant.deals = [];
        results.forEach(function(deal){
          if(deal.title != 'Simple booking'){
            if('exclusions' in deal){
              currentRestaurant.deals.push({
                title: deal.title,
                exclusions: deal.exclusions,
                is_menu: deal.is_menu,
                is_special_offer: deal.is_special_offer
              });
            }
            else {
              currentRestaurant.deals.push({
                title: deal.title,
                is_menu: deal.is_menu,
                is_special_offer: deal.is_special_offer
              });
            }
          }
        });

        setTimeout(function(){
          return resolve(restaurantsList);
        }, 0);
      })
    }
    else {
      console.log((idx+1) + ' : ' + currentRestaurant.name + ' is not on LaFourchette');
      setTimeout(function(){
        return resolve(restaurantsList);
      }, 0);
    }
  })
}

exports.getAllRestaurantsDealsOnLaFourchette = function(restaurantsList){
  restaurantsList.reduce(function(prev, elt, idx, array){
    return prev.then(function(restaurantsList){
      return getRestaurantsDeals(array, idx);
    })
  }, Promise.resolve([]))
  .then(function(restaurantsList){
    jsonfile.writeFile('restaurants_list_withDeals.json', restaurantsList, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
      console.log('-----------------------');
      console.log('Json with LaFourchette Deals done');
    })
  })
}
