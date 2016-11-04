var _async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var chalk = require('chalk');
var path = require('path');

var restaurantHash = {};

fs.readdir(path.join(__dirname, 'Data'), function (err, files) {
  files.forEach(function (file) {
    if(file.indexOf('csv') != -1) {
      fs.unlink(path.join(__dirname, 'Data', file), function (error) {
        if(error)
          console.error(error);
      });
    }
  });
})

var url = 'https://www.zomato.com/india';

console.log('Requesting Url : ' + url);

request(url, function (error, response, body) {
  if(error)
    console.error(error);

  else {
    console.log(chalk.blue('Loading Cheerio jq1'));
    var jq1 = cheerio.load(body);
    var cities = jq1(jq1('.mtop')[0]).find('a');

    console.log('Total Cities : ' + cities.length);

    _async.each(cities, function (city, callback_1) {
      var cityName = jq1(city).text().trim().replace('Restaurants', '');
      var cityUrl = jq1(city).attr('href');

      console.log('Requesting Url : ' + cityUrl);

      request(cityUrl, function (error, response, body) {
        if(error) {
          console.error(error);
          callback_1(error);
          return;
        }

        else  {
          console.log(chalk.blue('Loading Cheerio jq2'));
          var jq2 = cheerio.load(body);

          var locations = jq2('.col-l-1by3.col-s-8.pbot0');

          console.log('Total locations : ' + locations.length);

          _async.each(locations, function (location, callback_2) {
            var locationUrl =  jq2(location).attr('href');
            var temp = jq2(location).children().remove().end().text().trim();

            var locationName = temp;

            console.log('Requesting Url : ' + locationUrl);

            request(locationUrl + '?all=1', function (error, response, body) {
              if(error) {
                console.error(error);
                callback_2(error);
                return;
              }

              console.log(chalk.blue('Loading Cheerio jq3'));
              var jq3 = cheerio.load(body);

              var lastNumber = jq3('.col-l-4.mtop.pagination-number').children().children().last().text();

              console.log('Total Pages : ' + lastNumber);

              var pages = [];

              for(var i = 1; i <= parseInt(lastNumber); i++)
                pages.push(i);

              _async.each(pages, function (page, callback_3) {

                console.log('Requesting Url : ' + locationUrl + '?all=1&page=' + page);

                request(locationUrl + '?all=1&page=' + page, function (error, response, body) {
                  if(error) {
                    console.error(error);
                    callback_3(error);
                  }

                  else {
                    console.log(chalk.blue('Loading Cheerio jq4'));
                    var jq4 = cheerio.load(body);

                    var restaurants = jq4('.result-title.hover_feedback.zred.bold.ln24');

                    console.log(chalk.yellow('Restaurants found : ' + restaurants.length));

                    _async.each(restaurants, function (restaurant, callback_4) {
                      var restaurantName = jq4(restaurant).text().trim();

                      writeToFile(cityName.trim(), locationName.trim(), jq4(restaurant).text().trim());

                      callback_4(null);

                    }, function (error) {
                      if(error)
                        callback_3(error);

                      else
                        callback_3(null);
                    });
                  }
                });
              }, function (error) {
                if(error)
                  callback_2(error);

                else
                  callback_2(null);
              });
            });
          }, function (error) {
            if(error)
              callback_1(error);

            else {
              console.log(chalk.green(cityName + ' restaurant completed'));
              callback_1(null);
            }
          });
        }
      });
    }, function (error) {
      if(error)
        console.error(error);

      else {
        console.log('Program Completed');

        for(var key in restaurantHash)
          console.log(key + ' : ' + restaurantHash[key]);
      }
    });
  }
});

function writeToFile(city, location, restaurantName) {
  var data = city + ', ' + location + ', ' + restaurantName + '\n';
  var fileName = city + '.csv';

  if(restaurantHash[city])
    restaurantHash[city] = restaurantHash[city] + 1;

  else
    restaurantHash[city] = 1;

  fs.writeFileSync(path.join(__dirname, 'Data', fileName), data, { flag : 'a' });
}
