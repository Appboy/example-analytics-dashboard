import React, { Component } from 'react';
import _ from 'lodash';

class FilterSelector extends Component {

  render() {
    const optionDisplayHash = this.props.optionDisplayHash || {};
    // Expect options to be in the form of ({option: count})
    let options = _.map(this.props.options, (count, option) => {
      return (
        <tr key={option}>
          <td>
            <label>
              <input type="checkbox"
                     value={option}
                     style={styles.checkbox}
                     checked={_.includes(this.props.selectedOptions, option)}
                     onChange={this.props.handleSelectOption} />
              {optionDisplayHash[option] || option}
            </label>
          </td>
          <td>
            {count}
          </td>
        </tr>
      );
    });

    return (
      <table style={styles.optionsStyle}>
        <tbody>
          {options}
        </tbody>
      </table>
    );
  }
}

export default FilterSelector;

const styles = {
  optionsStyle: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    marginBottom: 10,
    width: "100%",
    fontSize: "14px"
  },
  checkbox: {
    marginRight: 5
  }
}
