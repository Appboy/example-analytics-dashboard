const defaultConfig = {
   APP_GROUP_ID: "INSERT_APP_GROUP_ID_HERE",
   CAMPAIGNS_API_URL: "https://rest.iad-01.braze.com/campaigns/",
  // How many requests to concurrently make to the braze API, limit this to
  // prevent 503s if necessary.
  REQUEST_CONCURRENCY: 10,
  // Chron timer for how frequently to run data sync, this is every 5th minute. (12:00, 12:05, 12:10,...)
  API_SYNC_CHRON: "*/5 * * * *",
  PORT: 5000,
  MONGODB_URI: "mongodb://localhost:27017/analytics_dash",
  USER_NAME: "admin",
  PASSWORD: "password",
  DAYS_OF_DATA_RETRIEVED: 90
}

module.exports = defaultConfig;

