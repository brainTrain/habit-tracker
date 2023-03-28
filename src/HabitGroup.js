// libraries
import { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import isEqual from 'lodash/isEqual';
import difference from 'lodash/difference';
// redux
import {
  selectFormattedHabitByID,
  selectHabitEntityByID,
} from './redux/habits';
import { selectHabitOptionsById } from './redux/habit-options';
// utils
import { mediaQueryDevice } from './styles/constants';
import {
  deleteHabit,
  DELETE_HABIT_BY_DAY,
  DELETE_ENTIRE_HABIT,
  DELETE_HABIT_DOCUMENT,
} from './firebase/firestore';
import { flattenHabitItems, TIME_INTERVAL_EMPTY } from './parsers/habit';
// components
import HabitGroupHeader from './HabitGroupHeader';
import HabitGroupOptions from './HabitGroupOptions';
import HabitChart from './HabitChart';
import HabitTable from './HabitTable';
import HabitCalendar from './HabitCalendar';
// reusable styles
import { habitDetailsGutterPadding } from './styles/layout';
// styles
const DateButton = styled.button`
  ${({ isActive }) => isActive && 'background-color: #FFF'};
`;

const DetailsContainer = styled.section`
  ${habitDetailsGutterPadding};
  border-top: 1px solid;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const DetailsTopContainer = styled.section`
  width: 100%;
`;

const DatesContainer = styled.div`
  width: 100%;
  overflow: auto;
  display: flex;
  gap: 0.5rem;

  ${habitDetailsGutterPadding};
  padding-bottom: 1rem;
`;

const DetailsBottomContainer = styled.section`
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;

  @media ${mediaQueryDevice.tablet} {
    flex-direction: row;
  }
`;

function HabitGroup({
  habitID,
  onAddHabit,
  onDeleteHabit,
  onAddHabitOption,
  userID,
}) {
  // redux props
  // NOTE: will probably be able to remove the isEqual deep check when these are flattened
  const {
    habitLabel,
    dateOrder,
    data: groupedData,
  } = useSelector((state) => selectFormattedHabitByID(state, habitID), isEqual);
  const habitEntity = useSelector((state) =>
    selectHabitEntityByID(state, habitID),
  );
  const habitOptions = useSelector((state) =>
    selectHabitOptionsById(state, habitID),
  );
  // local state
  const [isTableShown, setIsTableShown] = useState(false);
  const [isChartShown, setIsChartShown] = useState(false);
  const [isCalendarShown, setIsCalendarShown] = useState(false);
  const [currentDateString, setCurrentDateString] = useState(dateOrder[0]);
  const [habitDocuments, setHabitDocuments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [timeInterval, setTimeInterval] = useState({ ...TIME_INTERVAL_EMPTY });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prevDateOrderRef = useRef(dateOrder);

  useEffect(() => {
    const doesDateExist =
      dateOrder.indexOf(currentDateString) === -1 ? false : true;
    // if date doesn't exist then all documents for that group
    // have been deleted and we should set a date that does exist
    if (!doesDateExist) {
      setCurrentDateString(dateOrder[0]);
    }

    // if date order array grows, assume we have created an entry
    // for a new date and switch to that one this logic will switch
    // to the new entry in the array, even if it occurs before the latest
    const newDateOrder = difference(dateOrder, prevDateOrderRef.current);
    const hasNewDate = Boolean(newDateOrder.length);
    if (hasNewDate) {
      setCurrentDateString(newDateOrder[0]);
    }

    prevDateOrderRef.current = dateOrder;

    setIsMenuOpen(false);
  }, [dateOrder, currentDateString]);

  useEffect(() => {
    const currentGroupedData = groupedData[currentDateString];
    const currentTableData = currentGroupedData?.tableList || [];
    const currentTotalCount = currentGroupedData?.totalCount || 0;
    const currentTimeInterval = currentGroupedData?.timeInterval || {
      ...TIME_INTERVAL_EMPTY,
    };

    setHabitDocuments(currentTableData);
    setTotalCount(currentTotalCount);
    setTimeInterval(currentTimeInterval);
  }, [currentDateString, groupedData]);

  const handleToggleDetails = useCallback(() => {
    setIsTableShown((prev) => {
      return !prev;
    });
  }, []);

  const handleToggleChart = useCallback(() => {
    setIsChartShown((prev) => {
      return !prev;
    });
  }, []);

  const handleToggleCalendar = useCallback(() => {
    setIsCalendarShown((prev) => {
      return !prev;
    });
  }, []);

  const handleDateButtonClick = useCallback((newDate) => {
    setCurrentDateString(newDate);
  }, []);

  const toggleDetailsText = isTableShown ? 'hide details' : 'show details';
  const toggleChartText = isChartShown ? 'hide chart' : 'show chart';
  const toggleCalendarText = isCalendarShown
    ? 'hide calendar'
    : 'show calendar';
  const handleDeleteHabitByDay = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete all ${habitLabel} habits for ${currentDateString}?`,
      )
    ) {
      deleteHabit(habitDocuments)
        .then((bro) => {
          const deleteResponse = {
            operation: DELETE_HABIT_BY_DAY,
            habitDocuments,
            oldHabit: habitEntity,
            habitOptions,
          };
          onDeleteHabit(deleteResponse);
          setIsMenuOpen(false);
        })
        .catch((error) => {
          console.error('error deleting habit', error);
        });
    }
  }, [
    habitLabel,
    habitDocuments,
    onDeleteHabit,
    currentDateString,
    habitEntity,
    habitOptions,
  ]);

  const handleDeleteEntireHabit = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete this entire ${habitLabel} habit?`,
      )
    ) {
      const flatHabit = flattenHabitItems(groupedData);

      deleteHabit(flatHabit)
        .then(() => {
          const deleteResponse = {
            operation: DELETE_ENTIRE_HABIT,
            habitDocuments: flatHabit,
            oldHabit: habitEntity,
            habitOptions,
          };
          onDeleteHabit(deleteResponse);
          setIsMenuOpen(false);
        })
        .catch((error) => {
          console.error('error deleting habit', error);
        });
    }
  }, [habitLabel, groupedData, onDeleteHabit, habitEntity, habitOptions]);

  const handleOpenHabitOptions = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const handleCloseHabitOptions = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleDeleteHabitRecord = useCallback(
    (habit) => {
      const { count, datetime } = habit;
      const recordDate = datetime.toLocaleTimeString();

      if (
        window.confirm(
          `Are you sure you want to delete the record that has a count of ${count} and was recorded at ${recordDate}?`,
        )
      ) {
        deleteHabit([habit])
          .then(() => {
            const deleteResponse = {
              operation: DELETE_HABIT_DOCUMENT,
              habitDocuments: [habit],
              oldHabit: habitEntity,
              habitOptions,
            };
            onDeleteHabit(deleteResponse);
          })
          .catch((error) => {
            console.error('error deleting habit record', error);
          });
      }
    },
    [onDeleteHabit, habitEntity, habitOptions],
  );

  return (
    <section>
      <section>
        {!isMenuOpen ? (
          <HabitGroupHeader
            userID={userID}
            habitID={habitID}
            onAddHabitOption={onAddHabitOption}
            habitLabel={habitLabel}
            currentDateString={currentDateString}
            onAddHabit={onAddHabit}
            onOpenHabitOptions={handleOpenHabitOptions}
          />
        ) : (
          <HabitGroupOptions
            userID={userID}
            habitID={habitID}
            onAddHabitOption={onAddHabitOption}
            habitLabel={habitLabel}
            currentDateString={currentDateString}
            onCloseHabitOptions={handleCloseHabitOptions}
            onDeleteHabitByDay={handleDeleteHabitByDay}
            onDeleteEntireHabit={handleDeleteEntireHabit}
          />
        )}
      </section>
      <DatesContainer>
        {dateOrder.map((date) => {
          const isActive = date === currentDateString;

          return (
            <DateButton
              key={date}
              isActive={isActive}
              onClick={() => {
                handleDateButtonClick(date);
              }}>
              {date}
            </DateButton>
          );
        })}
      </DatesContainer>
      <DetailsContainer>
        <DetailsTopContainer>
          <p>total: {totalCount}</p>
          <p>
            duration: {timeInterval.hours}:{timeInterval.minutes}:
            {timeInterval.seconds}
          </p>
          <button onClick={handleToggleDetails}>{toggleDetailsText}</button>
          <button onClick={handleToggleChart}>{toggleChartText}</button>
          <button onClick={handleToggleCalendar}>{toggleCalendarText}</button>
        </DetailsTopContainer>
        <DetailsBottomContainer>
          {isTableShown ? (
            <HabitTable
              habitID={habitID}
              dateString={currentDateString}
              onDeleteHabitRecord={handleDeleteHabitRecord}
            />
          ) : null}
          {isChartShown ? (
            <HabitChart habitID={habitID} dateString={currentDateString} />
          ) : null}
          {isCalendarShown ? (
            <HabitCalendar
              dateOrder={dateOrder}
              currentDateString={currentDateString}
            />
          ) : null}
        </DetailsBottomContainer>
      </DetailsContainer>
    </section>
  );
}

HabitGroup.propTypes = {
  userID: PropTypes.string,
  habitID: PropTypes.string,
  onAddHabit: PropTypes.func,
  onAddHabitOption: PropTypes.func,
  onDeleteHabit: PropTypes.func,
};

HabitGroup.defaultProps = {
  userID: '',
  habitID: '',
  onAddHabit: function () {
    console.warn(
      'onAddHabit() prop in <HabitGroup /> component called without a value',
    );
  },
  onDeleteHabit: function () {
    console.warn(
      'onDeleteHabit() prop in <HabitGroup /> component called without a value',
    );
  },
};

export default HabitGroup;
