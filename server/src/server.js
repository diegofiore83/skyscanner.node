require('isomorphic-fetch');
require('es6-promise').polyfill();

const express = require('express');
const app = express();
const api = require('./api/');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World! The API is listening');
});

/**
  Api params and location values are here:
  http://business.skyscanner.net/portal/en-GB/Documentation/FlightsLivePricingQuickStart
*/
app.get('/api/search', (req, res) => {

  api.livePricing.search({
    fromPlace: req.query.fromPlace,
    toPlace: req.query.toPlace,
    fromDate: req.query.fromDate,
    toDate: req.query.oneway === "true" ? "" : req.query.toDate,
    adults: req.query.adults,
    class: req.query.class,
    locale: req.query.locale ? req.query.locale : "en-GB",
    market: req.query.market ? req.query.market : "UK",
    currency: req.query.currency ? req.query.currency : "GBP"
  })
  .then((results) => {
    
    switch (req.query.view) {
      case 'result' : {
        let uiResults = []; 
      
        results.Itineraries.forEach(function(itinerary) {
          
          let price = null;

          itinerary.PricingOptions.forEach(function(pricingOption) {
            let currentAgent = results.Agents.find(function findAgent(agent) {
              return agent.Id === pricingOption.Agents[0];
            });
            if (currentAgent.Type === 'Airline') {
              price = pricingOption;
              price.Agent = currentAgent;
            }
          });

          if (price === null) {
            price = itinerary.PricingOptions[0];
            price.Agent = results.Agents.find(function findAgent(agent) {
              return agent.Id === itinerary.PricingOptions[0].Agents[0];
            });;
          }
          
          let outboundLeg = results.Legs.find(function findOutboundLeg(leg) {
            return leg.Id === itinerary.OutboundLegId;
          });
    
          outboundLeg.Segments = [];
          outboundLeg.SegmentIds.forEach(function(segmentId) {
            outboundLeg.Segments.push(results.Segments.find(function findSegment(segment) {
              return segment.Id === segmentId;
            }));
    
            outboundLeg.Segments.forEach(function(segment){
              segment.CarrierElement = results.Carriers.find(function findCarrier(carrier){
                return carrier.Id === segment.Carrier;
              });
              segment.OriginPlace = results.Places.find(function findCarrier(place){
                return place.Id === segment.OriginStation;
              });
              segment.DestinationPlace = results.Places.find(function findCarrier(place){
                return place.Id === segment.DestinationStation;
              });
            });
    
          });

          let inboundLeg = null;
          let inboundSegments = [];
          
          if('InboundLegId' in itinerary) { 
            inboundLeg = results.Legs.find(function findInboundLeg(leg) {
              return leg.Id === itinerary.InboundLegId;
            });
            
            inboundLeg.SegmentIds.forEach(function(segmentId) {
              inboundSegments.push(results.Segments.find(function findSegment(segment) {
                return segment.Id === segmentId;
              }));
      
              inboundSegments.forEach(function(segment){
                segment.CarrierElement = results.Carriers.find(function findCarrier(carrier){
                  return carrier.Id === segment.Carrier;
                });
                segment.OriginPlace = results.Places.find(function findCarrier(place){
                  return place.Id === segment.OriginStation;
                });
                segment.DestinationPlace = results.Places.find(function findCarrier(place){
                  return place.Id === segment.DestinationStation;
                });
              });
            });

            inboundLeg.Segments = inboundSegments;
          }
    
          let result = {
            PricingOption: price,
            OutboundLeg: outboundLeg,
            InboundLeg: inboundLeg
          };
    
          let outboundValid = outboundLeg.Segments.length-1 <= req.query.maxStops;
          let inboundValid = inboundLeg === null ? true : (inboundLeg.Segments.length-1 <= req.query.maxStops ? true : false);

          if (outboundValid && inboundValid) {
            uiResults.push(result);
          }
        });
    
        res.json(uiResults);
      } break;
      default : {
        res.json(results);
      }
    }

  })
  .catch(console.error);
});

app.get('/api/geo/places', (req, res) => {
  
  api.geo.places()
    .then((results) => {
      res.json(results);
    })
    .catch(console.error);
});

app.get('/api/geo/places/countries', (req, res) => {
  
  api.geo.places()
    .then((results) => {
      
      let uiResults = []; 

      results.response.Continents.forEach((continent) => {
        continent.Countries.forEach((country) => {
           uiResults.push({
             "CurrencyId" : country.CurrencyId,
             "Id" : country.Id,
             "Name" : country.Name
           })
        });
      });

      res.json(uiResults);
    })
    .catch(console.error);
});

app.get('/api/reference/currencies', (req, res) => {
  
  api.reference.currencies()
    .then((results) => {
      res.json(results.response.Currencies);
    })
    .catch(console.error);
});

app.get('/api/reference/locales', (req, res) => {
  
  api.reference.locales()
  .then((results) => {
    res.json(results.response.Locales);
  })
  .catch(console.error);
});

app.get('/api/reference/markets', (req, res) => {

  api.reference.markets({
      locale: req.query.locale
  })
  .then((results) => {
    res.json(results.response.Countries);
  })
  .catch(console.error);
});

app.get('/api/autosuggest', (req, res) => {
  
    api.autosuggest.autosuggests({
        country: req.query.market,
        currency: req.query.currency,
        locale: req.query.locale,
        query: req.query.query
    })
    .then((results) => {
      res.json(results.response);
    })
    .catch(console.error);
  });

app.listen(80, () => {
  console.log('Node server listening on http://localhost:80');
});
