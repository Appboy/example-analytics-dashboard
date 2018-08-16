import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactTable from 'react-table'
import axios from 'axios'
import Table from './Table'
import FilterSelector from './FilterSelector'
import CSVDownloader from './CSVDownloader'
import DatePicker from './DatePicker'
import DataGraph from './DataGraph'
import Button from './Button'
import constants from './constants';

import 'react-table/react-table.css'
import _ from 'lodash'
import moment from 'moment';

const FRONTEND_REFRESH_FREQUENCY_MS = 60 * 1000;

class App extends Component {;
  constructor(props) {
    super(props);
    this.state = {
      variantRows: [],
      totals: {},
      totalsPercents: {},
      dailyTotals: [],
      dailyTotalsPercents: [],
      graphDates: [],
      fetching: true,
      startDate: moment().subtract(90,'days'),
      endDate: moment().add(1, 'day'),
      searchTerm: "",
      selectedTags: [],
      allTags: [],
      selectedChannels: [],
      allChannels: [],
      syncStatus: "",
      metaDataColumnKeys: [],
      showGraph: false,
      showSidebar: true
    };
    this.updateData = this.updateData.bind(this);
    this.handleUpdateSearchTerm = this.handleUpdateSearchTerm.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleSelectTag = this.handleSelectTag.bind(this);
    this.handleSelectChannel = this.handleSelectChannel.bind(this);
    this.debouncedUpdate = _.debounce(this.updateData, 250);

    this.currentCancelSource = null;
  }

  updateData() {
    let selectedTagsParams = _.join(_.map(this.state.selectedTags, (tag) => {
      return `tags=${tag}`;
    }), "&");

    let selectedChannelsParams = _.join(_.map(this.state.selectedChannels, (channel) => {
      return `channels=${channel}`;
    }), "&");

    if (!this.state.startDate || !this.state.endDate) {
      return;
    }

    if(this.currentCancelSource) {
      this.currentCancelSource.cancel();
    }

    let CancelToken = axios.CancelToken;
    this.currentCancelSource = CancelToken.source();

    this.setState({
      fetching: true
    });

    axios.get(`/campaigns?start=${this.state.startDate.format()}&end=${this.state.endDate.format()}&${selectedTagsParams}&${selectedChannelsParams}&term=${this.state.searchTerm}`,{
        cancelToken: this.currentCancelSource.token
      })
      .then(response => {
        if (response && response.data) {
          let json = response.data;
          this.setState({
            variantRows: json.variantRows,
            totals: json.totals,
            totalsPercents: json.totalsPercents,
            dailyTotals: json.dailyTotals,
            dailyTotalsPercents: json.dailyTotalsPercents,
            graphDates: json.graphDates,
            allTags: json.tags,
            allChannels: json.channels,
            syncStatus: json.syncStatus,
            metaDataColumnKeys: json.metaDataColumnKeys
          }, () => this.setState({fetching: false}));
        }
        this.currentCancelSource = null;
        return response.json();
      }).catch(e => {
        if (axios.isCancel(e)) {
          console.log('Request canceled', e.message);
        } else {
          this.currentCancelSource = null;
          this.setState({
            fetching: false
          });
        }
      });
  }

  handleDateChange({ startDate, endDate }) {
    this.setState({ startDate, endDate }, this.updateData);
  }

  handleStartDateChange(date) {
    this.setState({
      startDate: date
    }, this.updateData);
  }

  handleEndDateChange(date) {
    this.setState({
      endDate: date
    }, this.updateData);
  }

  handleUpdateSearchTerm(event) {
    this.setState({
      searchTerm: event.target.value
    }, this.debouncedUpdate);
  }

  handleSelectTag(event) {
    let val = event.target.value;
    let selectedTags = this.state.selectedTags;
    if (_.includes(selectedTags, val)) {
      _.pull(selectedTags, val);
    } else {
      selectedTags.push(val);
    }
    this.setState({
      selectedTags: selectedTags
    }, this.debouncedUpdate);
  }

  handleSelectChannel(event) {
    let val = event.target.value;
    let selectedChannels = this.state.selectedChannels;
    if (_.includes(selectedChannels, val)) {
      _.pull(selectedChannels, val);
    } else {
      selectedChannels.push(val);
    }
    this.setState({
      selectedChannels: selectedChannels
    }, this.debouncedUpdate);
  }

  componentDidMount() {
    setInterval(() => {
      this.updateData()
    }, FRONTEND_REFRESH_FREQUENCY_MS);
    this.updateData();
  }

  showAggregatePercentages() {
    return this.state.selectedChannels.length == 1 || _.keys(this.state.allChannels).length == 1
  }

  render() {
    let percentageWarning = "";
    if (!this.showAggregatePercentages()) {
      percentageWarning = (<i>* Aggregate percentages are only show when 1 channel is selected</i>);
    }

    return (
      <div className="App" style={styles.main}>
        <div style={_.extend({}, styles.leftSidebar, this.state.showSidebar ? {} : {width: "20px"})}>
          <div style={styles.braze.headerBlockBrazeGradient}>
            <img src="/meta/Braze-Logotype_White.png" width="100" />
            <div>
              {this.state.fetching
                ?  <div className="loadingBar"></div>
                : ""
              }
            </div>
          </div>
          <div style={styles.controls}>
            <div style={styles.controlSection.container}>
              <div style={styles.controlSection.header}>
                Data View
              </div>
              <div style={styles.buttonGroup}>
                <Button
                  label="Table"
                  handleClick={() => this.setState({ showGraph: false })}
                  isActive={!this.state.showGraph}
                />
                <Button
                  label="Graph"
                  handleClick={() => this.setState({ showGraph: true })}
                  isActive={this.state.showGraph}
                />
              </div>
            </div>
            <div style={styles.controlSection.container}>
              <div style={styles.controlSection.header}>
                Date Range
              </div>
              <DatePicker
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                updateDates={this.handleDateChange}
              />
            </div>
            <div style={styles.controlSection.container}>
              <div style={styles.controlSection.header}>
                Campaign/Variant Name
              </div>
              <input
                type="text"
                style={styles.input}
                onChange={this.handleUpdateSearchTerm}
                value={this.state.searchTerm}
              />
            </div>
            <div style={styles.controlSection.container}>
              <div style={styles.controlSection.header}>
                Tags
                <span style={styles.controlSection.campaignCountHeader}># Campaigns</span>
              </div>
              <FilterSelector
                options={this.state.allTags}
                selectedOptions={this.state.selectedTags}
                handleSelectOption={this.handleSelectTag}
              />
            </div>
            <div style={styles.controlSection.container}>
              <div style={styles.controlSection.header}>
                Channels
                <span style={styles.controlSection.campaignCountHeader}># Campaigns</span>
              </div>
              <FilterSelector
                options={this.state.allChannels}
                selectedOptions={this.state.selectedChannels}
                handleSelectOption={this.handleSelectChannel}
                optionDisplayHash={constants.CHANNELS_DISPLAY}
              />
              {percentageWarning}
            </div>
            <div style={styles.controlSection.container}>
              <div style={styles.controlSection.header}>
                CSV Export
              </div>
              <CSVDownloader
                totals={this.state.totals}
                totalsPercents={this.state.totalsPercents}
                variantRows={this.state.variantRows}
                metaDataColumnKeys={this.state.metaDataColumnKeys}
              />
            </div>
            <div style={styles.controlSection.container}>
              <div style={styles.controlSection.header}>
                API Sync Status
              </div>
              {this.state.syncStatus}
            </div>
          </div>
        </div>
        <div style={styles.rightSection}>
          <Table
            rows={this.state.variantRows}
            totals={this.state.totals}
            totalsPercents={this.state.totalsPercents}
            metaDataColumnKeys={this.state.metaDataColumnKeys}
            showTable={!this.state.showGraph}
            showPercentages={this.state.selectedChannels.length == 1 || _.keys(this.state.allChannels).length == 1}
          />
          <DataGraph
            dailyTotals={this.state.dailyTotals}
            dailyTotalsPercents={this.state.dailyTotalsPercents}
            dates={this.state.graphDates}
            showGraph={this.state.showGraph}
          />
        </div>
      </div>
    );
  }
}

export default App;

const styles = {
  main: {
    display: "flex",
    flexDirection: "row"
  },
  leftSidebar: {
    width: 300,
    height: "100vh",
    background: "#fbfbfb",
    boxSizing: "border-box",
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column"
  },
  rightSection: {
    flex: "1 1 auto",
    overflow: "auto",
    height: "100vh"
  },
  controls: {
    textAlign: "left",
    borderRight: "1px solid #eee",
    flex: "1 1 auto",
    overflowY: "scroll"
  },
  controlSection: {
    container: {
      padding: 20,
      borderBottom: "1px solid #eee",
      fontSize: "14px"
    },
    header: {
      marginBottom: 10,
      color: "#666",
      fontSize: "14px"
    },
    campaignCountHeader: {
      fontSize: "10px",
      float: "right",
      lineHeight: "18px"
    }
  },
  buttonGroup: {
    display: "flex"
  },
  input: {
    padding: 10,
    width: "100%",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  dateInput: {
    padding: 10,
    fontSize: "14px",
    boxSizing: "border-box"
  },
  expandButton: {
    float: "right",
    fontSize: "18px",
    lineHeight: "37px",
    color: "#fff",
    cursor: "pointer"
  },
  braze: {
    headerBlockBrazeGradient: {
      flex: "0 0 auto",
    	padding: 0,
      paddingTop: "20px",
      boxSizing: "border-box",
    	margin: 0,
    	height: 75,
    	background: "linear-gradient(30deg, #3accdd, #f7918e 64%, #ff9349 90%)",
    	backgroundImage: "linear-gradient(30deg, rgb(58, 204, 221), rgb(247, 145, 142) 64%, rgb(255, 147, 73) 90%)",
    }
  }
}
