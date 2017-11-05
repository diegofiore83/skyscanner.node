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
  res.send('Hello World!');
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
    toDate: req.query.toDate,
    adults: req.query.adults,
    class: req.query.class
  })
  .then((results) => {
    
    let uiResults = []; 

    results.Itineraries.forEach(function(itinerary) {
      
      let agent = results.Agents.find(function findAgent(agent) {
        return agent.Id === itinerary.PricingOptions[0].Agents[0];
      }).Name;
      
      let outboundLeg = results.Legs.find(function findOutboundLeg(leg) {
        return leg.Id === itinerary.OutboundLegId;
      });

      let inboundLeg = results.Legs.find(function findInboundLeg(leg) {
        return leg.Id === itinerary.InboundLegId;
      });

      let outboundSegments = [];
      outboundLeg.SegmentIds.forEach(function(segmentId) {
        outboundSegments.push(results.Segments.find(function findSegment(segment) {
          return segment.Id === segmentId;
        }));

        outboundSegments.forEach(function(segment){
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

      let inboundSegments = [];
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

      let result = {
        Price: itinerary.PricingOptions[0].Price,
        Agent: agent,
        InboundLeg: inboundLeg,
        InboundSegments: inboundSegments,
        OutboundLeg: outboundLeg,
        OutboundSegments: outboundSegments,
      };

      uiResults.push(result);
    });

    res.json(uiResults);
  })
  .catch(console.error);
});

app.listen(4000, () => {
  console.log('Node server listening on http://localhost:4000');
});
