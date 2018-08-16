const Promise = require('promise');
const fetch = require('node-fetch');
global.Headers = fetch.Headers;
const request = require('request');
const https = require('https');
const _ = require('lodash');
const constants = require('../constants');
const defaultConfig = require('../default_config');

const requestConcurrency = process.env.REQUEST_CONCURRENCY || defaultConfig.REQUEST_CONCURRENCY
const agent = new https.Agent({maxSockets: requestConcurrency});

const baseUrl = process.env.CAMPAIGNS_API_URL || defaultConfig.CAMPAIGNS_API_URL;

// Makes an API request to Braze's API and returns the
//  parsed result, or an error if the request fails, or Braze does
//  not return "success"
const makeRequest = (uri) => {
  let url = baseUrl + uri;
  return new Promise((resolve, reject) => {
    request(url, {agent: agent}, (error, response, body) => {
      if (error) {
        reject(error);
        return;
      }

      let parsedResponse = {};

      if (_.isNil(response)) {
        reject("No response from server");
        return;
      }

      if (response.statusCode != 200) {
        reject(response.statusCode + " " + response.statusMessage + " " + body);
        return;
      }

      try {
        parsedResponse = JSON.parse(body);
      } catch(error) {
        reject("Could not parse request body: " + body);
        return;
      }

      if (parsedResponse.message != 'success') {
        reject(parsedResponse.message);
        return;
      };

      resolve(parsedResponse);
    });
  });
}

module.exports.makeRequest = makeRequest;
