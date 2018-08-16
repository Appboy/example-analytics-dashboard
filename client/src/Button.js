import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';

class Button extends Component {

  render() {
    return (
      <button
        style={_.extend({}, styles.button, this.props.isActive ? styles.active: {})}
        className={"button-hover"}
        onClick={this.props.handleClick}>
        {this.props.label}
      </button>
    );
  }
}

export default Button;

const styles = {
  button: {
    border: "1px solid #ccc",
    flexGrow: "1",
    backgroundColor: "transparent",
    padding: "5px 10px",
    color: "#999",
    boxShadow: "none",
    outline: "none",
    cursor: "pointer",
    fontSize: "14px"
  },
  active: {
    background: "#3accdd",
    borderColor: "#3accdd",
    color: "#ffffff"
  }
}
