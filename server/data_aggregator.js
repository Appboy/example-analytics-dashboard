// Handles data aggregation operations for dashboard
const _ = require('lodash')
const constants = require('./constants');

// Returns day by day stat totals accross all variants
// {date => {stat1: count, stat2: count}}
const createDailyAggregateStatsFromVariantsData = (variantsData, channelsToExclude = [constants.COMBINED_PUSH]) => {
  let aggregatedStatsByDay = {};
  _.each(variantsData, (variantData) => {
    if (!_.includes(channelsToExclude, variantData.channel)) {

      _.each(variantData.dailyStats, (data, date) => {
        if (_.isNil(aggregatedStatsByDay[date])) {
          aggregatedStatsByDay[date] = {};
        }

        _.each(constants.STAT_TYPES, (stat) => {
          if (Number.isInteger(data[stat])) {
            if (_.isNil(aggregatedStatsByDay[date][stat])) {
              aggregatedStatsByDay[date][stat] = 0;
            }
            aggregatedStatsByDay[date][stat] = aggregatedStatsByDay[date][stat] + data[stat];
          }
        });
      });
    }
  });
  return aggregatedStatsByDay;
}

// Aggregates a daily stat set for a given variant
// {date => {stat1: count, stat2: count}} to {stat1: totalCount, stat2: totalCount}
const createAggregateStatsFromDailyStatFormat = (dailyStats) => {
  let aggregatedStats = {};
  _.each(dailyStats, function(stats, date) {
    _.each(constants.STAT_TYPES, function(statType) {
      if (Number.isInteger(stats[statType])) {
        if (_.isNil(aggregatedStats[statType])) {
          aggregatedStats[statType] = 0;
        }
        aggregatedStats[statType] = aggregatedStats[statType] + stats[statType];
      }
    });
  });
  return aggregatedStats;
}

// Takes in a set of aggregated stats in the form of {stat1: count, stat2: count}
// and returns a hash of stat percentages in the form of {stat1: %, stat2: % ...}
const getPercentageStats = (totals = {}) => {
  let percents = {};
  _.each(constants.STAT_TYPES, (statType) => {
    denominator = constants.STAT_PERCENTAGE_DENOMENATORS[statType]
    if (denominator && totals[denominator]) {
      if (!_.includes(constants.EXCLUDE_PERCENTAGES, statType)) {
        if (Number.isInteger(totals[statType])) {
          percents[statType] = totals[statType] / totals[denominator]
        }
      }
    }
  });
  return percents;
}

// Creates data for graph
// Returns data in the form
// {
//  dates: [unix_date, unix_date...] (1 for each day at 12am ET, for the date range in dailyTotals),
//  totalStats: {"stat1": [0, 3, 5...], "stat2": [0, 1, 4]...}, array order corresponds to date order,
//  percentageStats: {"stat1": [0.0, 0.3, 0.5...], "stat2": [0.0, 0.1, 0.4]...}, array order corresponds to date order,
// }
const getGraphData = (dailyTotals, dailyTotalsPercents) => {
  let dates = _.keys(dailyTotals);
  let totalStats = {};
  let percentageStats = {};
  _.each(dates, (date) => {
    if (dailyTotals[date]) {
      _.each(dailyTotals[date], (value, statKey) => {
        if (!totalStats[statKey]) {
          totalStats[statKey] = [];
        }
        totalStats[statKey].push(value);

        if (dailyTotalsPercents[date] && !_.includes(constants.EXCLUDE_PERCENTAGES, statKey)) {
          if (!percentageStats[statKey]) {
            percentageStats[statKey] = [];
          }
          percentageStats[statKey].push(dailyTotalsPercents[date][statKey] || 0);
        }
      });
    }
  });
  return {
    dates: dates,
    totalStats: totalStats,
    percentageStats: percentageStats
  }
}

// Generates all stats for the data table and graph
const generateDataForTableAndGraph = (variantsData = []) => {
  let dailyTotals = createDailyAggregateStatsFromVariantsData(variantsData);
  let dailyTotalsPercents = {};
  _.each(dailyTotals, (dailyTotal, date) => {
    dailyTotalsPercents[date] = getPercentageStats(dailyTotal);
  });
  let totals = createAggregateStatsFromDailyStatFormat(dailyTotals);
  let totalsPercents = getPercentageStats(totals);

  let variantRows = [];

  _.each(variantsData, (variantData) => {
    let dailyStats = variantData.dailyStats;
    let aggregateStats = createAggregateStatsFromDailyStatFormat(dailyStats);
    variantData.stats = aggregateStats;
    variantData.statsPercents = getPercentageStats(aggregateStats);
    variantData = _.omit(variantData, "dailyStats");
    // Exclude Control with 0 or undefined enrollments
    if(!(variantData.isControl && !variantData.stats.enrolled)) {
      variantRows.push(variantData);
    }
  });

  let graphData = getGraphData(dailyTotals, dailyTotalsPercents);

  return {
    variantRows: variantRows || [],
    totals: totals || {},
    totalsPercents: totalsPercents || {},
    graphDates: graphData.dates || [],
    dailyTotalsPercents: graphData.percentageStats || [],
    dailyTotals: graphData.totalStats || []
  }
}

module.exports.generateDataForTableAndGraph = generateDataForTableAndGraph
