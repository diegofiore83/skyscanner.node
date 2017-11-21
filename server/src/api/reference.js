/* eslint no-use-before-define:0 */
const request = require('request-promise');
const config = require('../config');

const localesUrl = config.skyscannerApi + 'apiservices/reference/v1.0/locales';
const currenciesUrl = config.skyscannerApi + 'apiservices/reference/v1.0/currencies';
const marketsUrl = config.skyscannerApi + 'apiservices/reference/v1.0/countries';

const reference = {
  api: {
    getCurrencies: () => {
      return request(currenciesUrl + `?apikey=${config.apiKey}`)  
    },
    getLocales: () => {
      return request(localesUrl + `?apikey=${config.apiKey}`)  
    },
    getMarkets: (params) => {
      return request(marketsUrl + `/` + params.locale + `?apikey=${config.apiKey}`)  
    }
  }
};

function getCurrencies () {
  console.log('getting currencies...');

  return new Promise((resolve, reject) => {
    reference.api.getCurrencies()
    .then((response) => {
      var data = JSON.parse(response);
      console.log('...currencies provided');
      resolve({
        response: data
      });
    }).catch(reject);  
  });
}

function getLocales () {
  console.log('getting locales...');

  return new Promise((resolve, reject) => {
    reference.api.getLocales()
    .then((response) => {
      var data = JSON.parse(response);
      console.log('...locales provided');
      resolve({
        response: data
      });
    }).catch(reject);  
  });
}

function getMarkets (params) {
  console.log('getting markets...');

  return new Promise((resolve, reject) => {
    reference.api.getMarkets(params)
    .then((response) => {
      var data = JSON.parse(response);
      console.log('...markets provided');
      resolve({
        response: data
      });
    }).catch(reject);  
  });
}

reference.currencies = () => {
  return new Promise((resolve, reject) => {
    getCurrencies()
      .then(resolve)
      .catch(reject);
  });
};

reference.locales = () => {
  return new Promise((resolve, reject) => {
    getLocales()
      .then(resolve)
      .catch(reject);
  });
};

reference.markets = (params) => {
  return new Promise((resolve, reject) => {
    getMarkets(params)
      .then(resolve)
      .catch(reject);
  });
};

module.exports = reference;