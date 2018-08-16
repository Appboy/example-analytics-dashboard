// Model for a single SyncStatus, which is created when an data sync either
// completes or fails
const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const moment = require('moment');

const syncStatusSchema = new Schema({
  sync_time: Date,
  error: String,
  success: Boolean
});

// Get most recently created SyncStatus that matches the query
syncStatusSchema.statics.getMostRecent = function(query = {}) {
  return new Promise((resolve, reject) => {
    this.find(query, null, {sort: {sync_time: -1}}, (error, statuses) => {
      if (error) {
        reject(error);
      } else {
        resolve(_.first(statuses));
      }
    });
  });
}

// Gets status message from SyncStatuses.
// If most recent is a success, return the time of sync.
// If most recent is a failure, return the failure time and time of last sync.
syncStatusSchema.statics.getStatusMessage = async function(query = {}) {
  try {
    let mostRecentSuccessStatus = await SyncStatus.getMostRecent({success: true});
    let mostRecentFailedStatus = await SyncStatus.getMostRecent({success: false});

    if (!mostRecentFailedStatus && !mostRecentSuccessStatus) {
      return "No data synced yet"
    } else if (!mostRecentFailedStatus || (mostRecentFailedStatus.sync_time <= mostRecentSuccessStatus.sync_time)) {
      return "Last API Sync Succeeded at " + moment(mostRecentSuccessStatus.sync_time).tz("America/New_York").format('MMMM Do YYYY, h:mm:ss a');
    } else if (!mostRecentSuccessStatus || mostRecentFailedStatus.sync_time > mostRecentSuccessStatus.sync_time) {
      let message = "Last API Sync Failed at " + moment(mostRecentFailedStatus.sync_time).tz("America/New_York").format('MMMM Do YYYY, h:mm:ss a') + "with error " + mostRecentFailedStatus.error;
      if (mostRecentSuccessStatus) {
        message = message + " Sync last succeeded at " + moment(mostRecentSuccessStatus.sync_time).tz("America/New_York").format('MMMM Do YYYY, h:mm:ss a');
      }
      return message;
    }
    return "No status";
  } catch(error) {
    console.log(error);
    return "Could Not Fetch Status";
  }
}

const SyncStatus = mongoose.model('SyncStatus', syncStatusSchema);

let statusMessage = "";

module.exports = SyncStatus;
