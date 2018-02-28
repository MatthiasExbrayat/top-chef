var cheerio = require('cheerio');
var request = require('request');
var jsonfile = require('jsonfile');

var pages = [];
var url =  "https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-"

for(var i=1; i<36; i++){
  pages.push(url+i.toString());
}

function getRestaurantsURLs(pageUrl, result) {
  return new Promise(function(resolve, reject){
    request(pageUrl, function(err, response, body){
      if(err){
        console.error(err);
        return reject(err);
      }

      $ = cheerio.load(body);

      $('.ds-1col.node.node--poi.view-mode-poi_card.node--poi-card').each(function(){
					var currentRestaurant = {
									URL_Michelin: 'https://restaurant.michelin.fr' + $('a', this).attr('href')
					};
					console.log(currentRestaurant.URL_Michelin);
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
    console.log((idx+1) + ' : getting informations of ' + restaurantsList[idx].URL_Michelin);
    request(restaurantsList[idx].URL_Michelin, function(err, response, body){
      if(err){
        console.error(err);
        return reject(err);
      }

      $ = cheerio.load(body);

			restaurantsList[idx].name = $('.poi_intro-display-title').text().trim();
			restaurantsList[idx].categories = $('.poi_intro-display-cuisines').text().replace(/;/g,',').trim();
			if($('span').hasClass('guide-icon icon-mr icon-cotation3etoiles')){
          restaurantsList[idx].michelinStars = 3;
      }
      else if ($('span').hasClass('guide-icon icon-mr icon-cotation2etoiles')) {
          restaurantsList[idx].michelinStars = 2;
      }
      else {
          restaurantsList[idx].michelinStars = 1;
			}
      restaurantsList[idx].address = {
        street: $('.street-block', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text(),
        postalCode: $('.postal-code', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text(),
        city: $('.locality', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text()
      }
			try
      {
        restaurantsList[idx].URL_image = $("img")[1].attribs['data-src']; // the image is always the second on the page
        //when there is no image for the restaurant the index 1 is a standart michelin image (which is ok when there is nothing)
      }
      catch (e)// just in case there is no images at all on the web page
      {
        restaurantsList[idx].URL_image = null;
			}

      setTimeout(function(){
        return resolve(restaurantsList);
      }, 100);
    });
  });
}

exports.getURLsOnMichelin = function() {
  pages.reduce(function(prev, elt, idx, array){
    return prev.then(function(results){
      return getRestaurantsURLs(elt, results)
    })
  }, Promise.resolve([]))
  .then(function(results){
    jsonfile.writeFile('restaurants_list_with_michelinURL.json', results, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
			console.log('-----------------------');
      console.log('Json with restaurants URL done');
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
    jsonfile.writeFile('restaurants_list_with_michelinInformations.json', restaurantsList, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
			console.log('-----------------------');
      console.log('Json with restaurants informations done');
      console.log("Number of restaurants: " + restaurantsList.length);
    });
  });
}
