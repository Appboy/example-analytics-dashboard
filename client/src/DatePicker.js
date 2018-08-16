import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import { DateRangePicker } from 'react-dates';
import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet';
import aphroditeInterface from 'react-with-styles-interface-aphrodite';
import DefaultTheme from 'react-dates/lib/theme/DefaultTheme';

ThemedStyleSheet.registerInterface(aphroditeInterface);
ThemedStyleSheet.registerTheme({
  reactDates: {
    ...DefaultTheme.reactDates,
    color: {
      ...DefaultTheme.reactDates.color,
      selectedSpan: {
        ...DefaultTheme.reactDates.color.selectedSpan,
       backgroundColor: "#3accdd"
     },
    },
  },
});

class DatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        focusedInput: null
    };
    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onDatesChange({ startDate, endDate }) {
    this.props.updateDates({ startDate, endDate })
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  isOutsideRange(day) {
    return day.isAfter(moment().add(1, 'day')) || day.isBefore(moment().subtract(91, 'days'));
  }

  render() {
    const { focusedInput } = this.state;
    return (
      <DateRangePicker
        onDatesChange={this.onDatesChange}
        onFocusChange={this.onFocusChange}
        focusedInput={focusedInput}
        small={true}
        isOutsideRange={this.isOutsideRange}
        startDate={this.props.startDate}
        endDate={this.props.endDate}
        startDateId="datepicker_start_home"
        endDateId="datepicker_end_home"
        startDatePlaceholderText="Start Date"
        endDatePlaceholderText="End Date"
        block={true}
        numberOfMonths={1}
        daySize={31}
        hideKeyboardShortcutsPanel
        initialVisibleMonth={
          () => {
            if (this.state.focusedInput === 'endDate') {
                return this.props.endDate;
            } else {
                return this.props.startDate;
            }
          }
        }
      />
    );
  }
}

export default DatePicker
