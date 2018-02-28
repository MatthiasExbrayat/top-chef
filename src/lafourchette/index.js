var cheerio = require('cheerio');
var request = require('request');
var jsonfile = require('jsonfile');

var foundedRestaurants = 0;

//search the restaurant in lafourchette and get the id
function getRestaurantsIDs(restaurantsList, idx) {
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
          currentRestaurant.LaFourchetteID = returnedRestaurant.id;
          currentRestaurant.isOnLaFourchette = true;
          currentRestaurant.URL_LaFourchette = 'https://www.lafourchette.com/restaurant/' + currentRestaurant.name.replace(/ /g, '-').replace(/--+/g, '-') + '/' + currentRestaurant.LaFourchetteID;
          foundedRestaurants++;
        }
      });

      if(currentRestaurant.LaFourchetteID == null){
        currentRestaurant.LaFourchetteID = null;
        currentRestaurant.isOnLaFourchette = false;
        currentRestaurant.URL_LaFourchette = null;
      }
      setTimeout(function(){
        return resolve(restaurantsList)
      }, 100)
    });
  });
}

function getRestaurantsDeals(restaurantsList, idx) {
  return new Promise(function(resolve, reject){
    var currentRestaurant = restaurantsList[idx];

    if(currentRestaurant.isOnLaFourchette){

      var restaurantUrl = 'https://m.lafourchette.com/api/restaurant/' + currentRestaurant.LaFourchetteID + '/sale-type';
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
                isMenu: deal.is_menu,
                isSpecialOffer: deal.is_special_offer
              });
            }
            else {
              currentRestaurant.deals.push({
                title: deal.title,
                isMenu: deal.is_menu,
                isSpecialOffer: deal.is_special_offer
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

exports.getAllRestaurantsIdOnLaFourchette = function(restaurantsList){
  restaurantsList.reduce(function(prev, elt, idx, array){
    return prev.then(function(restaurantsList){
      return getRestaurantsIDs(array, idx);
    })
  }, Promise.resolve([]))
  .then(function(restaurantsList){
    jsonfile.writeFile('restaurants_list_with_LaFourchetteIDs.json', restaurantsList, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
      console.log('-----------------------');
      console.log('Json with LaFourchette IDs done');
      console.log("Number of restaurants founded on LaFourchette : " + foundedRestaurants);
    })
  })
}

exports.getAllRestaurantsDealsOnLaFourchette = function(restaurantsList){
  restaurantsList.reduce(function(prev, elt, idx, array){
    return prev.then(function(restaurantsList){
      return getRestaurantsDeals(array, idx);
    })
  }, Promise.resolve([]))
  .then(function(restaurantsList){
    jsonfile.writeFile('restaurants_list_with_LaFourchetteDeals.json', restaurantsList, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
      console.log('-----------------------');
      console.log('Json with LaFourchette Deals done');
    })
  })
}
