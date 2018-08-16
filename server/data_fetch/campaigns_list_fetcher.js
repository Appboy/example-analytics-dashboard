// This module handles fetching Campaigns from the
// Braze "campaings/list endpoint"
const Promise = require('promise');
const _ = require('lodash');
const Campaign = require('../models/campaign');
const SyncStatus = require('../models/sync_status');
const apiRequestHelper = require("./api_request_helper");

const defaultConfig = require('../default_config');

const agEnv = process.env.APP_GROUP_ID || defaultConfig.APP_GROUP_ID;
const appGroupId = "app_group_id=" + agEnv;

// Gets Campaigns from a given page, and persists those campaigns
// to the database
// Returns {
//  shouldSearchNextPage: Boolean: Whether or not to search the next page.
//    true if more than one campaigns returned for the page requested
// }
const getCampaignsForPage = async (page) => {
  let response = {shouldSearchNextPage: false}
  let listUri = "list?" + appGroupId + "&page=" + page + "&include_archived=false&sort_direction=desc";
  let apiResponse = await apiRequestHelper.makeRequest(listUri)

  let campaigns = null;

  if (apiResponse) {
    campaigns = apiResponse.campaigns;
  }

  if (campaigns && campaigns.length > 0) {
    let updates = _.map(campaigns, (campaignData) => {
      return new Promise((resolve, reject) => {
        Campaign.findOneAndUpdate({campaign_id: campaignData.id}, {
          name: campaignData.name,
          campaign_id: campaignData.id
        }, {upsert: true, new: true}, (err, result) => {
          if (err) {
            reject("Error while fetching campaigns list while saving campaign: " + err);
          }
          if (!result) {
            result = new Campaign({
              campaign_id: campaignData.id,
              campaign_name: campaignData.name
            })
            result.save(function(err) {
              resolve();
            });
          } else {
            resolve();
          }
        });
      });
    });

    await Promise.all(updates)

    response.shouldSearchNextPage = true;
  } else {
    response.shouldSearchNextPage = false;
  }
  return response;
}

// Gets all campaigns from DB and creates or updates mongo docs from those campaigns.
// Makes requests page by page, recursing unitl a given page has 0 results.
const updateCampaignsListPageByPage = async (currentPage = 0) => {
  let response = await getCampaignsForPage(currentPage)
  console.log("Search page" + currentPage);
  if (response.shouldSearchNextPage) {
    currentPage = currentPage + 1;
    return updateCampaignsListPageByPage(currentPage);
  } else {
    return true;
  }
}

module.exports.updateCampaignsList = updateCampaignsListPageByPage;
