import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import _ from 'lodash'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import constants from './constants';
import {CSVLink, CSVDownload} from 'react-csv';

const SPECIAL_COLUMN_WIDTHS = {
  lastSent: 250,
  campaignName: 200,
  subjectMessage: 200
}

class Table extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render table when the data changes,
    // otherwise will cost an expensive render each time
    // user modifies any of the filters.
    return !_.isEqual(this.props.rows, nextProps.rows) || !_.isEqual(this.props.showTable, nextProps.showTable);
  }

  statSort(a, b) {
    if ((a === null || a === undefined) && (b === null || b === undefined)) {
      return 1;
    } else if (a === null || a === undefined) {
      return -1;
    } else if (b === null || b === undefined) {
      return 1;
    } else {
      return a > b ? 1 : -1;
    }
  }

  // Don't show broken out rows in table
  filterOutPushChannelRows(rows) {
    return _.filter(rows, (row) => {
      return !_.includes(constants.PUSH_CHANNELS, row.channel)
    });
  }

  createMetaDataColumn(key) {
    let accessor = key;
    // Still use lastSent value for date sorting
    if (key == "lastSentDateOnly") {
      accessor = (d) => d["lastSent"];
    }
    return {
      id: key,
      Header: constants.COLUMN_DISPLAY_NAMES[key],
      Cell: row => {
        if (key == "lastSentDateOnly" && row.value) {
          return (moment(row.value).format('MM/DD/YYYY'));
        }
        else if (key == "channel" && row.value) {
          return (constants.CHANNELS_DISPLAY[row.value] || row.value)
        } else {
          return (row.value);
        }
      },
      accessor: accessor,
      minWidth: SPECIAL_COLUMN_WIDTHS[key] || 100
    };
  }

  createColumns() {
    let columns = [{
      Header: 'Variant Info',
      columns: _.map(_.difference(this.props.metaDataColumnKeys, constants.COLUMNS_AT_END_OF_TABLE, constants.COLUMNS_EXCLUDE_FROM_TABLE), (key) => {
        return this.createMetaDataColumn(key)
      })
    }];

    let statColumns = _.map(_.keys(this.props.totals), (statType) => {
      let columnsForStatType = [{
        id: statType,
        Header: "Total",
        accessor: (d) => {
          return d.stats[statType]
        },
        sortMethod: this.statSort,
        Cell: row => {
          if (row.value == null) {
            return (<span style={{color: "#ccc"}}>--</span>);
          } else {
            return (Number(row.value).toLocaleString());
          }
        },
        Footer: (
          <div style={styles.footer}>
            {Number(this.props.totals[statType]).toLocaleString()}
          </div>
        )
      }];

      if (this.props.totalsPercents[statType] != null) {
        columnsForStatType.push({
          id: statType + "%",
          Header: "Rate",
          accessor: (d) => {
            return d.statsPercents[statType];
          },
          Cell: row => {
            if (row.value == null) {
              return (<span style={{color: "#ccc"}}>--</span>);
            } else {
              return ((row.value * 100.0).toFixed(2) + "%");
            }
          },
          sortMethod: this.statSort,
          Footer: () => {
            let val = "";
            if(this.props.showPercentages) {
              return (
                <div style={styles.footer}>
                  {(((this.props.totalsPercents[statType] || 0) * 100.0).toFixed(2) + "%")}
                </div>
              );
            } else {
              return (
                <div style={styles.hidePercentage}>
                  --
                </div>
              );
            }
          }
        });
      }

      return {
        Header: constants.COLUMN_DISPLAY_NAMES[statType],
        columns: columnsForStatType
      }
    });

    let endOfTableMetaDataColumns = []
    if (!_.isEmpty(this.props.metaDataColumnKeys)) {
      endOfTableMetaDataColumns = [{
        Header: "Tags/Channel",
        columns: _.map(constants.COLUMNS_AT_END_OF_TABLE, (key) => {
          return this.createMetaDataColumn(key)
        })
      }];
    }

    columns = columns.concat(statColumns).concat(endOfTableMetaDataColumns)

    return columns;
  }

  render() {
    let rows = this.filterOutPushChannelRows(this.props.rows)
    return (
      <ReactTable
        data={rows}
        noDataText="No Data Found"
        columns={this.createColumns()}
        pageSizeOptions={[20, 100, 500]}
        defaultPageSize={100}
        defaultSorted={[{id: 'lastSentDateOnly', desc: true}]}
        style={_.extend({}, styles.table, {display: this.props.showTable ? 'flex' : 'none'})}
        className="-striped -highlight"
      />
    );
  }
}

export default Table;

const styles = {
  table: {
    width: "100%",
    height: "100vh",
    border: "none",
    fontSize: "14px"
  },
  footer: {
    padding: "15px 0",
    fontWeight: "bold"
  },
  hidePercentage: {
    padding: "15px 0",
    color: "#999"
  }
}
