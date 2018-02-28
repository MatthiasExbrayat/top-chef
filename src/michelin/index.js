var cheerio = require('cheerio');
var request = require('request');
var jsonfile = require('jsonfile');

var pages = [];
var url =  "https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-"

for(var i=1; i<36; i++){
  pages.push(url+i.toString());
}

function getRestaurantsUrls(pageUrl, result) {
  return new Promise(function(resolve, reject){
    request(pageUrl, function(err, response, body){
      if(err){
        console.error(err);
        return reject(err);
      }

      $ = cheerio.load(body);

      $('.ds-1col.node.node--poi.view-mode-poi_card.node--poi-card').each(function(){
					var currentRestaurant = {
									michelinUrl: 'https://restaurant.michelin.fr' + $('a', this).attr('href')
					};
					console.log(currentRestaurant.michelinUrl);
          result.push(currentRestaurant);
      });

      setTimeout(function(){
        return resolve(result);
      }, 100);
    });
  });
}

function getRestaurantsInformations(restaurantsList, idx) {
  return new Promise(function(resolve, reject){
    console.log((idx+1) + ' : getting informations of ' + restaurantsList[idx].michelinUrl);
    request(restaurantsList[idx].michelinUrl, function(err, response, body){
      if(err){
        console.error(err);
        return reject(err);
      }

      $ = cheerio.load(body);

			restaurantsList[idx].name = $('.poi_intro-display-title').text().trim();
			restaurantsList[idx].category = $('.poi_intro-display-cuisines').text().replace(/;/g,',').trim();
			if($('span').hasClass('guide-icon icon-mr icon-cotation3etoiles')){
          restaurantsList[idx].stars = 3;
      }
      else if ($('span').hasClass('guide-icon icon-mr icon-cotation2etoiles')) {
          restaurantsList[idx].stars = 2;
      }
      else {
          restaurantsList[idx].stars = 1;
			}
      restaurantsList[idx].address = {
        street: $('.street-block', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text(),
        postalCode: $('.postal-code', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text(),
        city: $('.locality', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text()
      }
			try
      {
        restaurantsList[idx].imageUrl = $("img")[1].attribs['data-src']; // the image is always the second on the page
        //when there is no image for the restaurant the index 1 is a standart michelin image (which is ok when there is nothing)
      }
      catch (e)// just in case there is no images at all on the web page
      {
        restaurantsList[idx].imageUrl = null;
			}

      setTimeout(function(){
        return resolve(restaurantsList);
      }, 100);
    });
  });
}

exports.getUrlsOnMichelin = function() {
  pages.reduce(function(prev, elt, idx, array){
    return prev.then(function(results){
      return getRestaurantsUrls(elt, results)
    })
  }, Promise.resolve([]))
  .then(function(results){
    jsonfile.writeFile('michelin_restaurants_urls_list.json', results, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
			console.log('-----------------------');
      console.log('Json with restaurants url done');
      console.log("Number of restaurants: " + results.length);
    });
  });
}

exports.getRestaurantsInformationsOnMichelin = function(restaurantsList) {
  restaurantsList.reduce(function(prev, elt, idx, array){
    return prev.then(function(restaurantsList){
      return getRestaurantsInformations(array, idx);
    })
  }, Promise.resolve([]))
  .then(function(restaurantsList){
    jsonfile.writeFile('michelin_restaurants_informations_list.json', restaurantsList, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
			console.log('-----------------------');
      console.log('Json with restaurants informations done');
      console.log("Number of restaurants: " + restaurantsList.length);
    });
  });
}
