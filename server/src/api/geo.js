/* eslint no-use-before-define:0 */
const _ = require('lodash');
const request = require('request-promise');
const config = require('../config');

const geoUrl = config.skyscannerApi + 'apiservices/geo/v1.0';

const geo = {
  api: {
    getPlaces: () => {
      return request(geoUrl + `?apikey=${config.apiKey}`)  
    }
  }
};

function getPlaces () {
  console.log('getting places...');

  return new Promise((resolve, reject) => {
    geo.api.getPlaces()
    .then((response) => {
      var data = JSON.parse(response);
      console.log('...places provided');
      resolve({
        response: data
      });
    }).catch(reject);  
  });
}

geo.places = () => {
  return new Promise((resolve, reject) => {
    getPlaces()
      .then(resolve)
      .catch(reject);
  });
};

module.exports = geo;