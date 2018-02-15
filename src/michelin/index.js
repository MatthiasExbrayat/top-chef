var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');

module.exports.getRestaurants = function(){

  var counter = 0;
  var nameList = [];
  var urlList = [];
  var addressList = [];
  var restaurants = [];

  setTimeout(function(){
    console.log("\n-------Getting Names and URLs of starred restaurants-------\n");
    for(i = 0; i < 35; i++){
      url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin'.concat('/page-',i);
      request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(html);
          restaurantsByPage = $('div[attr-gtm-type="poi"]');
          urlByPage = $('a[class="poi-card-link"]');
          for (j = 0; j < restaurantsByPage.length; j++) {
                nameList[counter] = restaurantsByPage[j].attribs['attr-gtm-title'];
                urlList[counter] = urlByPage[j].attribs['href'];
                console.log(counter+1 + " : " + nameList[counter]);
                counter++;
          }
        }
      });
    }
  }, 100);

  setTimeout(function(){
    console.log("\n-------Getting Address of starred restaurants-------\n\n");
    for(i = 0; i < counter; i++){
      url = "https://restaurant.michelin.fr/"+urlList[i];
      console.log('[' + (i+1) +'/' + counter + '] calling ' + url);
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          $ = cheerio.load(body);
          object = {
            street: $('.street-block', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text(),
            postalCode: $('.postal-code', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text(),
            city: $('.locality', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text()
          }
          addressList.push(object);
        }
      });
    }
    console.log("\n-------Creating the Json file \"michelin_restaurants_list.json\"-------");
  }, 5000);

  setTimeout(function(){
    for(i = 0; i < counter; i++){
      var restaurant = {};
      restaurant.name = nameList[i];
      restaurant.url = "https://restaurant.michelin.fr"+urlList[i];
      restaurant.address = addressList[i];
      restaurants.push(restaurant);
    }
    jsonfile.writeFile('michelin_restaurants_list.json', restaurants, {spaces : 2}, function(err){})
    console.log("-------Json file \"michelin_restaurants_list.json\" created !-------\n");
  }, 70000);

  return restaurants;
}
