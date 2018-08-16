import React, { Component } from 'react';
import { Line } from "react-chartjs-2";
import _ from 'lodash';
import moment from 'moment';
import constants from './constants';
import Button from './Button'

const STAT_COLORS = {
    sent: "#032045",
    opens: "#06DBD8",
    unique_opens: "#F4CE64",
    clicks: "#F97836",
    unique_clicks: "#F14B12",
    unsubscribes: "#2B3D56",
    bounces: "#F14739",
    delivered: "#EBB0A6",
    reported_spam: "#278B4D",
    errors: "#155677",
    direct_opens: "#3A7D67",
    total_opens: "#6DC2AC",
    body_clicks: "#A9D8B6",
    impressions: "#7EAA8E",
    first_button_clicks: "#731147",
    second_button_clicks: "#9E3633",
    unique_recipients: "#3ACCDD",
    conversions: "#D38849"
};

class DataGraph extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectAll: true
    };
  }

  createTotalsDataSets() {
    return _.map(this.props.dailyTotals, (data, statKey) => {
      return {
        data: data,
        label: constants.COLUMN_DISPLAY_NAMES[statKey],
        fill: false,
        borderColor: STAT_COLORS[statKey],
        backgroundColor: STAT_COLORS[statKey]
      }
    });
  }

  selectDeselectAll(selectAll) {
    console.log(this.refs);
    let graph = this.refs.graph.chartInstance;
    _.each(graph.data.datasets, (dataSet) => {
      if(selectAll) {
        dataSet.hidden = null;
        dataSet._meta[0].hidden = null;
        dataSet._meta[0].dataset.hidden = false;
      } else {
        dataSet.hidden = true;
        dataSet._meta[0].dataset.hidden = true;
      }
    });
    graph.update();
  }

  render() {
    const data = {
      labels: _.map(this.props.dates, (date) => {
        return moment(date * 1000).format("MM/DD/YYYY")
      }),
      datasets: this.createTotalsDataSets()
    }

    const options = {
        legend: {
          position: 'left'
        },
        maintainAspectRatio: false
    }
    return (
      <div style={_.extend({}, styles.graphContainer, {display: this.props.showGraph ? 'block' : 'none'})}>
        <div style={{display: !_.isEmpty(this.props.dailyTotals) ? 'block' : 'none', width: "100%", height: "100%"}}>
          <Button
            label="Select All"
            handleClick={() => this.selectDeselectAll(true)}
          />
          <Button
            label="Deselect All"
            handleClick={() => this.selectDeselectAll(false)}
          />
          <Line data={data} options={options} ref="graph"/>
        </div>
        <div style={{display: _.isEmpty(this.props.dailyTotals) ? 'block' : 'none'}}>
          No Data
        </div>
      </div>
    );
  }
}

export default DataGraph;

const styles = {
  graphContainer: {
    padding: 20,
    boxSizing: "border-box",
    textAlign: "left",
    height: "100%"
  }
}
