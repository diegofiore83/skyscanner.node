/* eslint no-use-before-define:0 */
const request = require('request-promise');
const config = require('../config');

const autosuggestUrl = config.skyscannerApi + 'apiservices/autosuggest/v1.0/';

const autosuggest = {
  api: {
    getAutosuggests: (params) => {
      return request(autosuggestUrl + `${params.country}/${params.currency}/${params.locale}?query=${params.query}&apikey=${config.apiKey}`)  
    }
  }
};

function getAutosuggests (params) {
  console.log('getting autosuggests...');

  return new Promise((resolve, reject) => {
    autosuggest.api.getAutosuggests(params)
    .then((response) => {
      var data = JSON.parse(response);
      console.log('...autosuggests provided');
      resolve({
        response: data
      });
    }).catch(reject);  
  });
}

autosuggest.autosuggests = (params) => {
  return new Promise((resolve, reject) => {
    getAutosuggests(params)
      .then(resolve)
      .catch(reject);
  });
};

module.exports = autosuggest;