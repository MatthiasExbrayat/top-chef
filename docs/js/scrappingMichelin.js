var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var jsonfile = require('jsonfile');

var counter = 0;
var namesList = [];
var linksList = [];

setTimeout(function(){
  console.log("SCRAPPING");
  for(i = 0; i < 35; i++){
    url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin'.concat('/page-',i);
    request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
        restByPage = $('div[attr-gtm-type="poi"]');
        linkByPage = $('a[class="poi-card-link"]');
        for (j = 0; j < restByPage.length; j++) {
            namesList[counter] = restByPage[j].attribs['attr-gtm-title'];
            linksList[counter] = linkByPage[j].attribs['href'];
            console.log(counter + " " + namesList[counter] + " " + linksList[counter]);
            counter++;
      }

    }

  });
  }
}, 100);


setTimeout(function(){
  console.log("JSON PART");
  var tab = [];
  for(i = 0; i < counter; i++){
      var object = {};
      object.name = namesList[i];
      object.url = "https://restaurant.michelin.fr/"+linksList[i];
      tab.push(object);
  }
  console.log(tab);
  jsonfile.writeFile('output.json', tab, {spaces : 2}, function(err){})
}, 5000);
