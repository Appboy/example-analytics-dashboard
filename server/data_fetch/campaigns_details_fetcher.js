// This module handles fetching Campaign details
// Braze "campaings/details endpoint"
const Promise = require('promise');
const _ = require('lodash');

const Campaign = require('../models/campaign');
const apiRequestHelper = require("./api_request_helper");
const defaultConfig = require('../default_config');

const agEnv = process.env.APP_GROUP_ID || defaultConfig.APP_GROUP_ID;
const appGroupId = "app_group_id=" + agEnv;

// Update the Campaign objects with data from the details endpoint.
const updateCampaignsDetails = async () => {
  let campaigns = await Campaign.getCampaigns().catch((error) => {
    throw error;
    return;
  });

  let statsUpdatePromises = _.map(campaigns, (campaign) => {
    return new Promise(async (resolve, reject) => {
      let timeSeriesUri = "details?" + appGroupId + "&campaign_id=" + campaign.campaign_id;
      try {
        let apiResponse = await apiRequestHelper.makeRequest(timeSeriesUri);

        let responseData = null

        if (apiResponse) {
          responseData = apiResponse;
        }

        campaign.updateVariantMetaDataFromData(responseData);
        campaign.save((error) => {
          if (error) {
            reject("Error while updating details for campaign, campaign id: " + campaign.campaignId + " " + error);
          } else {
            resolve();
          }
        });
      } catch(error) {
        console.log(error);
        reject("Error while updating details for campaign, campaign id: " + campaign.campaignId + " " + error);
      }
    });
  });

  await Promise.all(statsUpdatePromises).catch((error) => {
    throw error;
    return;
  });

  return true
};

module.exports.updateCampaignsDetails = updateCampaignsDetails
