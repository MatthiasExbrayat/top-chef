var cheerio = require('cheerio');
var request = require('request');
var jsonfile = require('jsonfile');

var countFound = 0;

//search the restaurant in lafourchette and get the id of the restaurant
function getId(restaurants, idx) {
  return new Promise(function(resolve, reject){
    var restaurant = restaurants[idx];
    var url = 'https://m.lafourchette.com/api/restaurant-prediction?name=' + restaurant.name.replace(/ /g, '_').replace(/&|°/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    console.log('Searching restaurant n°' + (idx+1) + ' on ', url);
    request({
      method: 'GET',
      url: url
    }, function(err, response, body){
      if(err){
        console.error(err);
        return reject(err);
      }

      var results = JSON.parse(body);
      results.forEach(function(restaurant_found){
        if(restaurant.address.postalCode == restaurant_found.address.postal_code){
          restaurant.idLafourchette = restaurant_found.id;
          restaurant.isFoundOnLafourchette = true;
          countFound++;
        }
      });

      setTimeout(function(){
        return resolve(restaurants)
      }, 0)
    });
  });
}

exports.searchAllRestaurants = function(restaurants){
  restaurants.reduce(function(prev, elt, idx, array){
    return prev.then(function(restaurants){
      return getId(array, idx);
    })
  }, Promise.resolve([]))
  .then(function(restaurants){
    jsonfile.writeFile('lafourchette_restaurants_list.json', restaurants, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
      console.log();
      console.log(countFound + ' restaurants founded on lafourchette.')
    })
  })
}

function getDeals(restaurants, idx) {
  return new Promise(function(resolve, reject){
    var restaurant = restaurants[idx];

    if('isFoundOnLafourchette' in restaurant){
      var url = 'https://m.lafourchette.com/api/restaurant/' + restaurant.idLafourchette + '/sale-type';
      console.log('Searching deals for restaurant n°' + (idx+1) + ' on ', url);
      request({
        method: 'GET',
        url: url
      }, function(err, response, body){
        if(err){
          console.error(err);
          return reject(err);
        }

        var results = JSON.parse(body);
        restaurant.promotions = [];
        results.forEach(function(promotion){
          if(promotion.title != 'Simple booking'){
            if('exclusions' in promotion){
              restaurant.promotions.push({
                title: promotion.title,
                exclusions: promotion.exclusions,
                menu: promotion.is_menu,
                specialOffer: promotion.is_special_offer
              });
            }
            else {
              restaurant.promotions.push({
                title: promotion.title,
                menu: promotion.is_menu,
                specialOffer: promotion.is_special_offer
              });
            }
          }
        });

        setTimeout(function(){
          return resolve(restaurants);
        }, 0);
      })
    }
    else {
      console.log('Restaurant n°' + (idx+1) + ' not found on lafourchette');
      setTimeout(function(){
        return resolve(restaurants);
      }, 0);
    }
  })
}

exports.getAllRestaurantDeals = function(restaurants){
  restaurants.reduce(function(prev, elt, idx, array){
    return prev.then(function(restaurants){
      return getDeals(array, idx);
    })
  }, Promise.resolve([]))
  .then(function(restaurants){
    jsonfile.writeFile('lafourchette_restaurants_deals_list.json', restaurants, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
    })
  })
}
