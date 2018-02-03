var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');

module.exports.getRestaurants = function(){

  var counter = 0;
  var nameList = [];
  var urlList = [];

  setTimeout(function(){

    console.log("-------Scrapping the pages-------\n");

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

  var tab = [];

  setTimeout(function(){

    console.log("\n-------Creating the Json file \"restaurants_list.json\"-------");

    for(i = 0; i < counter; i++){

        var object = {};
        object.name = nameList[i];
        object.url = "https://restaurant.michelin.fr/"+urlList[i];
        tab.push(object);

    }

    jsonfile.writeFile('restaurants_list.json', tab, {spaces : 2}, function(err){})

    console.log("-------Json file \"restaurants_list.json\" created !-------\n");

  }, 5000);

  return tab;

}
