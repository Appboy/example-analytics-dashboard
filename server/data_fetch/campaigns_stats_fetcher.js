// This module handles fecthing Campaigns from the
// Braze "campaings/data_series endpoint"
const Promise = require('promise');
const _ = require('lodash');
const moment = require('moment');
const Campaign = require('../models/campaign');
const apiRequestHelper = require("./api_request_helper");
const defaultConfig = require('../default_config');

const agEnv = process.env.APP_GROUP_ID || defaultConfig.APP_GROUP_ID;
const appGroupId = "app_group_id=" + agEnv;
const daysBack = process.env.DAYS_OF_DATA_RETRIEVED || defaultConfig.DAYS_OF_DATA_RETRIEVED;

// Update the Campaign objects with data from the data_series endpoint.
// param: numDaysBack = number of days back to search for data from today.
const updateCampaignsStats = async (numDaysBack = daysBack) => {
  let campaigns = await Campaign.getCampaigns().catch((error) => {
    throw error;
    return;
  });

  let statsUpdatePromises = _.map(campaigns, (campaign) => {
    return new Promise(async (resolve, reject) => {
      let timeSeriesUri = "data_series?" + appGroupId + "&campaign_id=" + campaign.campaign_id + "&length=" + numDaysBack;
      try {
        let apiResponse = await apiRequestHelper.makeRequest(timeSeriesUri);

        let responseData = null

        if (apiResponse) {
          responseData = apiResponse.data;
        }

        campaign.updateVariantStatsFromData(responseData);
        campaign.save((error) => {
          if (error) {
            reject("Error while updating stats for campaign, campaign id: " + campaign.campaignId + " " + error);
            return;
          } else {
            resolve();
            return;
          }
        });
      } catch(error) {
        console.log(error);
        reject("Error while updating stats for campaign, campaign id: " + campaign.campaignId + " " + error);
        return;
      }
    });
  });

  await Promise.all(statsUpdatePromises).catch((e) => {
    throw e;
    return;
  });

  return true;
};

module.exports.updateCampaignsStats = updateCampaignsStats
