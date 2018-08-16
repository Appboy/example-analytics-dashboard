// Model for a single Campaign
const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const moment = require('moment');
const constants = require('../constants');

const campaignSchema = new Schema({
  name: String,
  campaign_id: String,
  variants_stats: {type: Schema.Types.Mixed, default: {}},
  variants_meta_data: {type: Schema.Types.Mixed, default: {}},
  tags: Array,
  channels: Array,
  draft: Boolean,
  first_sent: Date,
  last_sent: Date,
  created_at: Date,
  updated_at: Date
});

// Gets day by day stats for given variants within the startDate and endDate
// inclusive.
// Returns in the form of
// {unix_date(12am for day EST) => {"stat1": 0, "stat2": 1, ...}}
const generateDailyStatsHash = (variantStats, startDate, endDate) => {
  startDate = moment(startDate).startOf("day").unix();
  endDate = moment(endDate).startOf("day").unix();
  let dailyStats = {};

  _.each(variantStats, function(stats, date) {
    let statDate = date;

    if (statDate >= startDate && statDate <= endDate) {
      dailyStats[statDate] = stats;
    }
  });
  return dailyStats;
};

// Gets data from campaign for variants that are included in validChannels
// Data will include statistics between the startDate and endDate
// Returns an array of objects, with one for each variant in the Campaign.
// [{campaignId: "campaign1", channel: "apple_push", dailyStats: generateDailyStatsHash(),
//  {campaignId: "campaign1", channel: "android_push"}, dailyStats: generateDailyStatsHash(),
//  {campaignId: "campaign1", channel: "email"}, dailyStats: generateDailyStatsHash()]
campaignSchema.methods.getDataFromCampaign = function(startDate, endDate, validChannels) {
  let rows = [];
  let variantStats = this.variants_stats;
  let campaignName = this.name;
  let campaignId = this.campaign_id;
  let campaignDraft = this.draft;
  let campaignTags = this.tags;
  let campaignLastSent = this.last_sent;
  let campaignFirstSent = this.first_sent;
  let combinedPushRow = {};

  _.each(this.variants_meta_data, function(metaData, key) {
    let includeChannel = true

    if (!_.isEmpty(validChannels)) {
      includeChannel = _.includes(validChannels, metaData.channel);
    }

    if (includeChannel) {
      let dailyStats = generateDailyStatsHash(variantStats[key], startDate, endDate);
      if (!_.isEmpty(dailyStats)) {

        // Handle "Combined Push Row", by combining stats from each channel that
        // is in constants.PUSH_CHANNELS.
        // ASSUMPTION: Assume that the alert for the pushes are all the same, since we're
        // returning the first non null alert for the combined row. If you have different
        // content for android and ios, only one will be reflected.
        if (_.includes(constants.PUSH_CHANNELS, metaData.channel)) {
          if (_.isEmpty(combinedPushRow)) {
            combinedPushRow = {
              campaignId: campaignId,
              campaignName: campaignName,
              isDraft: campaignDraft,
              variantName: null,
              tags: campaignTags,
              channel: constants.COMBINED_PUSH,
              subjectMessage: metaData.alert,
              firstSent: campaignFirstSent,
              lastSentDateOnly: campaignLastSent.toLocaleDateString(),
              lastSentTimeOnly: campaignLastSent.toLocaleTimeString(),
              lastSent: campaignLastSent,
              dailyStats: _.cloneDeep(dailyStats)
            }
          } else {
            // Add the first message that isn't null as the message row
            if (!combinedPushRow.message && metaData.alert) {
              combinedPushRow.subjectMessage = metaData.alert;
            }
            let combinedDailyStats = combinedPushRow.dailyStats || {};
            _.each(dailyStats, (stat, date) => {
              if (combinedDailyStats[date] == null) {
                combinedDailyStats[date] = stat;
              } else {
                _.each(stat, (value, statType) => {
                  if (combinedDailyStats[date][statType] == null) {
                    combinedDailyStats[date][statType] = value;
                  } else {
                    combinedDailyStats[date][statType] = combinedDailyStats[date][statType] + value;
                  }
                });
              }
            });
          }
        }

        let row = {
          campaignId: campaignId,
          campaignName: campaignName,
          isDraft: campaignDraft,
          variantName: metaData.name,
          tags: campaignTags,
          channel: metaData.channel,
          subjectMessage: metaData.subject || metaData.alert,
          firstSent: campaignFirstSent,
          lastSentDateOnly: campaignLastSent.toLocaleDateString(),
          lastSentTimeOnly: campaignLastSent.toLocaleTimeString(),
          lastSent: campaignLastSent,
          dailyStats: dailyStats,
          isControl: metaData.type == "control"
        };
        rows.push(row);
      }
    }
  });

  if (!_.isEmpty(combinedPushRow)) {
    rows.push(combinedPushRow);
  }

  return rows;
};

// Update the variant_stats attribute from the API response.
// This method can handle multichannel or multivariant campaings, and converts
// data into the form of:
// {"channel [- variationName (optional, if multivariant)]":
//   {unix date: {"stat1": 0, "stat2"...}, unix date: {"stat1": 0, "stat2"...}}
// }}
campaignSchema.methods.updateVariantStatsFromData = function(stats) {
  let variantStats = {}

  _.each(stats, (data) => {
    let time = data.time;
    _.each(data.messages, (channelMessages, channel) => {
      _.each(channelMessages, (message) => {
        let key = channel;
        // If multivariate, key the variant off of the channel - variant_name combo,
        // otherwise just the channel
        if (message.variation_name) {
          key = `${key} - ${message.variation_name}`;
        }

        variantStats[key] = variantStats[key] || {};
        variantStats[key][moment(time).unix()] = message;
      });
    });
  });
  this.variants_stats = variantStats;
};

// Update some campaign metadata and the variant_metadata attribute from the API response.
// This method can handle multichannel or multivariant campaings, and converts
// data into the form of:
// {"channel [- variationName (optional, if multivariant)]":
//   {"alert": "", "subject": "", ...}
// }}
campaignSchema.methods.updateVariantMetaDataFromData = function(metaData) {
  this.name = metaData.name;
  this.tags = metaData.tags;
  if (metaData.first_sent && metaData.last_sent) {
    this.first_sent = Date.parse(metaData.first_sent);
    this.last_sent = Date.parse(metaData.last_sent);
  }

  this.draft = metaData.draft;

  let variantsMetaData = {};
  let allChannels = []

  _.each(metaData.messages, function(message, variationId) {
    let key = message.channel;
    allChannels.push(message.channel);

    if (message.name) {
      key = `${key} - ${message.name}`;
    }

    variantsMetaData[key] = {};
    _.extend(variantsMetaData[key], message);

  });

  allChannels = _.uniq(allChannels);

  this.channels = allChannels;
  this.variants_meta_data = variantsMetaData;
};

// Returns all Campaigns that match query.
campaignSchema.statics.getCampaigns = function(query = {}) {
  return new Promise((resolve, reject) => {
    this.find(query, (error, campaigns) => {
      if (error) {
        reject(error);
      } else {
        resolve(campaigns);
      }
    });
  });
}

// Get tags and channels counts for all campaigns passed in.
// Returns: {
//   tags: {"tag1": 1, "tag2": 0, ...},
//   channels: {"channel1": 2, ...}
// }
// NOTE: channels replaces individual push channels with COMBINED_PUSH.
campaignSchema.statics.getTagsAndChannelsFromCampaigns = function(campaigns) {
  let allTags = {};
  let allChannels = {};
  _.each(campaigns, (campaign) => {

    _.each(campaign.tags, (tag) => {
      if (allTags[tag]) {
        allTags[tag] = allTags[tag] + 1;
      } else {
        allTags[tag] = 1;
      }
    });

    let channels = campaign.channels || [];

    if (_.intersection(channels, constants.PUSH_CHANNELS).length > 0) {
      channels = _.difference(channels, constants.PUSH_CHANNELS);
      channels = channels.concat(constants.COMBINED_PUSH);
    }

    _.each(channels, (channel) => {
      if (allChannels[channel]) {
        allChannels[channel] = allChannels[channel] + 1;
      } else {
        allChannels[channel] = 1;
      }
    });
  });

  return {
    tags: allTags,
    channels: allChannels
  };
};

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
