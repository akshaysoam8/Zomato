var _async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

var url = 'https://www.zomato.com/india';

fs.writeFile('output.csv', '');

console.log('Requesting Url : ' + url);

request(url, function (error, response, body) {
  if(error)
    console.log(error);

  else {
    var jq1 = cheerio.load(body);
    var cities = jq1('.mtop a');

    console.log('Total Cities : ' + cities.length);

    _async.eachSeries(cities, function (city, callback_1) {
      var cityName = jq1(city).text().trim();
      var cityUrl = jq1(city).attr('href');

      console.log('Requesting Url : ' + cityUrl);

      request(cityUrl, function (error, response, body) {
        console.log('Loading Cheerio');
        var jq2 = cheerio.load(body);

        var locations = jq2('.col-l-1by3.col-s-8.pbot0');

        console.log('Total locations : ' + locations.length);

        _async.eachSeries(locations, function (location, callback_2) {
          var locationUrl =  jq2(location).attr('href');
          var temp = jq2(location).text().trim();

          var locationName = temp;

          console.log('Requesting Url : ' + locationUrl);

          request(locationUrl + '?all=1', function (error, response, body) {
            if(error) {
              console.log(error);
              callback_2(error);
              return;
            }

            var jq3 = cheerio.load(body);

            var lastNumber = jq3('.col-l-4.mtop.pagination-number').children().children().last().text();

            console.log('Total Pages : ' + lastNumber);

            var pages = [];

            for(var i = 1; i <= parseInt(lastNumber); i++)
              pages.push(i);

            _async.eachSeries(pages, function (page, callback_3) {

              console.log('Requesting Url : ' + locationUrl + '?all=1&page=' + page);

              request(locationUrl + '?all=1&page=' + page, function (error, response, body) {
                if(error) {
                  console.log(error);
                  callback_3(error);
                }

                else {
                  var jq4 = cheerio.load(body);

                  var restaurants = jq4('.result-title.hover_feedback.zred.bold.ln24');

                  console.log('Restaurants found : ' + restaurants.length);

                  _async.eachSeries(restaurants, function (restaurant, callback_4) {
                    console.log(cityName + ' ' + locationName + ' ' + jq4(restaurant).text().trim());
                    writeToFile(cityName, locationName, jq4(restaurant).text().trim());
                    callback_4(null);
                  }, function () {
                    callback_3(null);
                  });
                }
              });
            }, function () {
              callback_2(null);
            });
          });
        }, function () {
          callback_1(null);
        });
      });
    });
  }
});

function writeToFile(city, location, restaurantName) {
  fs.writeFile('output.csv', city + ', ' + location + ', ' + restaurantName + '\n', { flag : 'a' });
}
