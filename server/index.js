const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const defaultConfig = require('./default_config');
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');

const PORT = process.env.PORT || defaultConfig.PORT;

const dataSync = require("./data_fetch/data_sync");
const Campaign = require('./models/campaign');
const SyncStatus = require('./models/sync_status');
const dataAggregator = require("./data_aggregator");
const constants = require('./constants');

const Authentication = require('./util/Authentication');

const CronJob = require('cron').CronJob;
const cronTime = process.env.API_SYNC_CHRON || defaultConfig.API_SYNC_CHRON

const dbUrl = process.env.MONGODB_URI || defaultConfig.MONGODB_URI;
mongoose.connect(dbUrl);

// Priority serve any static files.
app.use('/meta', express.static(path.resolve(__dirname, '../client/build/meta')));
app.use('/static', express.static(path.resolve(__dirname, '../client/build/static')));

// Answer API requests.
require('./router')(app);

app.listen(PORT, function () {
  console.error(`Node cluster worker ${process.pid}: listening on port ${PORT}`);
});

console.log("Starting Data Sync");
dataSync.updateData();
let job = new CronJob(cronTime, function() {
    console.log("Starting Data Sync");
    dataSync.updateData();
  },
  null,
  false,
  'America/New_York'
);

job.start();
