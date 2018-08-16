import {CSVLink, CSVDownload} from 'react-csv';
import React, { Component } from 'react';
import _ from 'lodash'
import constants from './constants';

class CSVDownloader extends Component {

    shouldComponentUpdate(nextProps, nextState) {
      // Only re-render when the data changes
      return !_.isEqual(this.props.variantRows, nextProps.variantRows);
    }

    formatDataForCsv(channelsToExclude = ["push"]) {
      let headers = _.map(_.difference(this.props.metaDataColumnKeys, constants.COLUMNS_AT_END_OF_TABLE), (header) => {
          return {value: header, isPercent: false};
      });
      headers = headers.concat(_.map(_.keys(this.props.totals), (header) => {
          return {value: header, isPercent: false};
      }));

      let headersWithPercents = [];

      _.each(headers, (header) => {
        headersWithPercents.push(header);
        if (this.props.totalsPercents[header.value] != null) {
          headersWithPercents.push({value: header.value, isPercent: true})
        }
      });

      headers = headers.concat(_.map(constants.COLUMNS_AT_END_OF_TABLE, (header) => {
          return {value: header, isPercent: false};
      }));

      let rows = _.compact(_.map(this.props.variantRows, (variantRow) => {
        if (_.includes(channelsToExclude, variantRow.channel)) {
          return
        }
        let row = _.map(headersWithPercents, (header) => {
          let headerValue = header.value
          if (variantRow[headerValue] != null) {
            return variantRow[headerValue];
          } else if (!header.isPercent && variantRow.stats[headerValue] != null) {
            return variantRow.stats[headerValue];
          } else if (header.isPercent && variantRow.statsPercents[headerValue] != null) {
            return variantRow.statsPercents[headerValue];
          } else {
            return null;
          }
        });
        return row;
      }));

      headers = _.map(headersWithPercents, (header) => {
        let displayValue = constants.COLUMN_DISPLAY_NAMES[header.value] || header.value;
        if (header.isPercent) {
          if (displayValue.slice(-1) == "s") {
            displayValue = displayValue.slice(0, -1);
          }
          displayValue = displayValue + " Rate"
        }
        return displayValue;
      });

      let csvData = [headers];

      csvData = csvData.concat(rows)
      return csvData;
    }

    render() {
      return (
        <CSVLink data={this.formatDataForCsv()}
                 filename={"csv-download.csv"}
                 style={{color: "#3accdd"}}>
           Download Data as CSV
        </CSVLink>
      );
    }
}

export default CSVDownloader;
