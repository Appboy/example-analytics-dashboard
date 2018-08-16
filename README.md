# Braze Analytics Dashboard

The goal of this dashboard is to provide an example of the flexibility our REST API endpoints allow for customized reporting needs. Please note that this project is NOT one that will be actively supported/enhanced by Braze as it is intended only to serve as an example.

## How it Works
The analytics dashboard allows you to view key performance metrics of your campaigns in real time. You can search and filter your data by **name, message content, tags, and message channels.** Data is shown on a campaign, variant, and aggregated basis.

The dashboard syncs with Braze every 5 minutes to update your data. It also refreshes on your browser every 5 minutes and whenever you search/filter so your data remains up to date.

The application uses REACT for its frontend and Node.js as the backend server with a MongoDb database.

## How it Looks

After you go through the steps detailed in the following sections, your dashboard should look like this:

<img width="1239" alt="screen shot 2018-07-19 at 3 26 58 pm" src="https://user-images.githubusercontent.com/40368878/42967326-e48ea90a-8b6d-11e8-99a1-52c74695121f.png">


This is the landing page of the dashboard; it shows a table of your appgroup's campaigns with the collected stats for each respective campaign. You could also switch the "Data View" on the sidebar to "Graph" which will generate a graph with a variety of stats that you can select/deselect to help you analyze your data. This is how the graph view looks:

<img width="1035" alt="screen shot 2018-07-18 at 2 51 59 pm" src="https://user-images.githubusercontent.com/40368878/42966407-06b31bcc-8b6b-11e8-9790-c1cfdba5d3b5.png">

You could also utilize the sidebar to do things such as filtering your view based on tags or channels, or downloading the data as a CSV file:

<img width="266" alt="screen shot 2018-07-19 at 3 45 36 pm" src="https://user-images.githubusercontent.com/40368878/42966338-d03afccc-8b6a-11e8-8bbe-72601cd813ab.png">

## Deploying to Heroku
This assumes some knowledge of setting up an application through Heroku. For more details on how to deploy to Heroku, check out [Heroku's deployment documentation](https://devcenter.heroku.com/categories/deployment).

###  Generate an API key from the Braze Dashboard 
Create a new API key through API Settings on the Braze Developer Console. This allows you to generate an API Key that can only access the required export endpoints instead of the full access key.

You can read more about our API Settings in the [Braze Academy](https://www.braze.com/academy/App_Settings/#api-settings-tab).

The required export endpoints for this analytics dashboard are:
1. campaigns.list
2. campaigns.data_series
3. campaigns.details

*After generating the API key, make sure to paste it into server/default_config.js*

### Fork repo and connect to Heroku
The heroku build script is in a config file that should enable you to deploy without having to run any custom build scripts.
You can deploy your code to heroku by going on the deploy dashboard from your heroku app, and connecting it.

### Setup a Mongo database
The dashboard stores data in a Mongo database. For simplicity, we'd recommend setting one up through the [Heroku MongoLab addon](https://elements.heroku.com/addons/mongolab), but you can use your own Mongo instance if you'd like.

### Set Config Variables
Set config variables for your app. By default, the config variables connect to Braze's staging app group with a local mongodb instance. You can find the default config values in server/default_config.js

Set up the following variables on Heroku when you deploy (under the Settings tab in Heroku dashboard, the Config Vars header (there will be a button that says "Reveal Config Vars").

##### Required

|**Variable**  |Description | 
|---|---|
|**APP_GROUP_ID**  |API Key for your App Group | 
|**CAMPAIGNS_API_URL**  |Your REST API URL + /campaigns/ (i.e. https://rest.iad-01.braze.com/campaigns/)|  
|**MONGODB_URI**  | The URI to your mongodb instance you will use for your analytics data. MongoLab is a simple Heroku addon to setup a mongo database. Once you set it up, it will give you a driver URI that will look like: `mongodb://<dbuser>:<dbpassword>@XXXXXX.mlab.com:XXXXXX/XXXXX`. If you don't want to use MongoLab, you can also use any other mongo instance you'd like, you just need the connection URI  |  
|**USER_NAME**  |  A username to login to your dashboard |  
|**PASSWORD**  |  A password to login to your dashboard |  
| **TZ**  |  The timezone you want your data displayed in. Use tz timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones |  

##### Optional
We would recommend leaving these as default unless you have a specific need to change them.

|**Variable**  |Description | 
|---|---|
|  **REQUEST_CONCURRENCY** | How many requests the dashboard concurrently makes to Braze when updating data. (default 10). Increasing this number will speed up data updates, but may cause API timeouts if set too high  |
| **API_SYNC_CHRON**  |  How frequently the data updates from Braze. (default "*/5 * * * *" -> 5 minutes). This variable is in [Cron time](https://en.wikipedia.org/wiki/Cron) |
| **DAYS_OF_DATA_RETRIEVED**  | How far in the past data is retrieved for. (default 90 days, this value is subject to API restrictions on past data retrieval)  |

### Deploy
Once you setup your Config variables you can deploy the application. (Which can be done via Deploy on your Heroku dashboard).

## Running Locally
* Setup a local mongo db instance on your machine. It's typically in the form of: mongodb://localhost:27017/DB_NAME. Update the `MONGODB_URI` URL in `server/defualt_config.js` to match your mongo URI. You may also want to update `CAMPAIGNS_API_URL`, and `APP_GROUP_ID` to match your app group if you don't want our default data (see heroku deploy instructions for more info).
* Open 2 console windows since the React and Node apps both need to be ran.
* Open `/server` in one, and `npm install` `npm start`, this should automatically start fetching data from Braze.
* Open `/client` in the other and `npm install` `npm start`, this should automatically open the dashboard.

