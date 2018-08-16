const Campaign = require('../models/campaign');
const SyncStatus = require('../models/sync_status');
const listFetcher = require("./campaigns_list_fetcher");
const statsFetcher = require("./campaigns_stats_fetcher");
const detailsFetcher = require("./campaigns_details_fetcher");

// Do data update for campaigns.
// If all updates succeed, log a success sync status.
// If anything fails, log a failed status.
module.exports.updateData = async function() {
  try {
    let campaignsListResponse = await listFetcher.updateCampaignsList();
    let campaignsStatsResponse = await statsFetcher.updateCampaignsStats();
    let campaignsDetailsResponse = await detailsFetcher.updateCampaignsDetails();
    console.log("Successfully Updated");
    SyncStatus.create({sync_time: new Date(), success: true});
  } catch(error) {
    console.log("Update Failed");
    console.log(error);
    SyncStatus.create({sync_time: new Date(), success: false, error: error});
  }
}
