// libraries
import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DateObject } from 'react-multi-date-picker';
import { dateStringToObject } from './formatters/datetime';
import { Calendar } from 'react-multi-date-picker';
import styled from 'styled-components';
// styles
const CalendarWrapper = styled.section``;

function HabitCalendar({ currentDateString, dateOrder }) {
  const [calendarValues, setCalendarValues] = useState(
    dateOrder.map((date) => {
      return dateStringToObject(date);
    }),
  );
  const [currentDateObject, setCurrentDateObject] = useState(
    new DateObject({
      year: 1969,
      month: 4,
      day: 20,
    }),
  );
  const calendarRef = useRef(null);

  useEffect(() => {
    const newCurrentDateObject = dateStringToObject(currentDateString);

    setCurrentDateObject(newCurrentDateObject);
  }, [currentDateString]);

  useEffect(() => {
    const newCalendarValues = dateOrder.map((date) => {
      return new Date(date);
    });

    setCalendarValues(newCalendarValues);
  }, [dateOrder]);

  useEffect(() => {
    calendarRef?.current?.set('year', currentDateObject.year);
    calendarRef?.current?.set('month', currentDateObject.month);
    calendarRef?.current?.set('day', currentDateObject.day);
  }, [currentDateObject]);

  return (
    <CalendarWrapper>
      <Calendar
        ref={calendarRef}
        value={calendarValues}
        currentDate={currentDateObject}
        readOnly
      />
    </CalendarWrapper>
  );
}

HabitCalendar.propTypes = {
  dateOrder: PropTypes.arrayOf(PropTypes.string),
  currentDateString: PropTypes.string,
};

HabitCalendar.defaultProps = {
  dateOrder: [],
  currentDateString: '',
};

export default HabitCalendar;
