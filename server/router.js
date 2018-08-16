const Authentication = require('./util/Authentication');
const _ = require('lodash');
const listFetcher = require("./data_fetch/data_sync");
const Campaign = require('./models/campaign');
const SyncStatus = require('./models/sync_status');
const dataAggregator = require("./data_aggregator");
const constants = require('./constants');
const path = require('path')
const moment = require('moment');

module.exports = function(app){
  app.get('/campaigns', async function (req, res) {
    let startDate = req.query.start
    let endDate = req.query.end
    let tags = req.query.tags;
    let channels = req.query.channels;
    let searchTerm = req.query.term;

    try {
      let tagChannelQuery = {}
      let dateQuery = {}

      if (startDate) {
        dateQuery["last_sent"] = { $gte: new Date(moment(startDate).startOf("day").valueOf()) };
      }
      if (endDate) {
        dateQuery["first_sent"] = { $lte: new Date(moment(endDate).startOf("day").valueOf()) };
      }
      if (!_.isEmpty(tags)) {
        // If just one tag, sends as a string, make an array for query
        if (!_.isArray(tags)) {
          tags = [tags]
        }
        tagChannelQuery["tags"] = { $in: tags }
      }
      if (!_.isEmpty(channels)) {
        // If just one channel, sends as a string, make an array for query
        if (!_.isArray(channels)) {
          channels = [channels]
        }
        if (_.includes(channels, constants.COMBINED_PUSH)) {
          channels = _.without(channels, constants.COMBINED_PUSH);
          channels = channels.concat(constants.PUSH_CHANNELS);
        }
        tagChannelQuery["channels"] = { $in: channels }
      }

      console.log("START Qa" + moment().valueOf());
      let campaigns = await Campaign.getCampaigns(_.extend({}, dateQuery, tagChannelQuery));
      console.log("END Qa" + moment().valueOf());
      console.log("START Qb" + moment().valueOf());
      let allCampaigns = await Campaign.getCampaigns({campaign_id: {$ne: null}});
      console.log("END Qb" + moment().valueOf())

      console.log("START Q2" + moment().valueOf());
      data = _.flatten(_.map(campaigns, function(campaign) {
        return campaign.getDataFromCampaign(startDate, endDate, channels);
      }));
      console.log("END Q2" + moment().valueOf());


      if (!_.isEmpty(searchTerm)) {
        data = _.filter(data, (variant) => {
          let isFound = false;
          let matcher = new RegExp(searchTerm, "i");
          if(variant.campaignName) {
            isFound = isFound || matcher.test(variant.campaignName);
          }
          if(!isFound && variant.variantName) {
            isFound = isFound || matcher.test(variant.variantName);
          }

          return isFound;
        });
      }

      campaignIdsFromData = _.uniq(_.map(data, (variant) => variant.campaignId));

      console.log("START Q3" + moment().valueOf());
      let campaignsMatchingFilter = await Campaign.getCampaigns({campaign_id: {$in: campaignIdsFromData}});
      console.log("END Q3" + moment().valueOf());

      let channelsAndTagsForAll = Campaign.getTagsAndChannelsFromCampaigns(allCampaigns);
      let channelsAndTagsForSelected = Campaign.getTagsAndChannelsFromCampaigns(campaignsMatchingFilter);

      _.each(channelsAndTagsForAll.tags, (count, tag) => {
        channelsAndTagsForAll.tags[tag] = channelsAndTagsForSelected.tags[tag] || 0;
      });
      _.each(channelsAndTagsForAll.channels, (count, channel) => {
        channelsAndTagsForAll.channels[channel] = channelsAndTagsForSelected.channels[channel] || 0;
      });

      let responseData = dataAggregator.generateDataForTableAndGraph(data);

      let statusMessage = await SyncStatus.getStatusMessage()
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify(_.extend(
        {
          "channels": channelsAndTagsForAll.channels,
          "tags": channelsAndTagsForAll.tags,
          "metaDataColumnKeys": constants.META_DATA_VALUES_TO_SHOW,
          "syncStatus": statusMessage
        },
        responseData)));
    } catch(error) {
      console.log(error);
    }
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', Authentication.BasicAuthentication, function(request, response) {
    response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}
