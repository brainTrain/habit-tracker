// libraries
import { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useDetectClickOutside } from 'react-detect-click-outside';
import {
  VictoryBar,
  VictoryChart,
  VictoryTooltip,
  VictoryZoomContainer,
} from 'victory';
import { format } from 'date-fns';
import { Calendar, DateObject } from 'react-multi-date-picker';
import isEqual from 'lodash/isEqual';
// redux
import {
  selectFormattedHabitByID,
  selectHabitEntityByID,
} from './redux/habits';
import { selectHabitOptionsById } from './redux/habit-options';
// utils
import { habitDetailsGutterPadding } from './styles/layout';
import { mediaQueryDevice } from './styles/constants';
import {
  deleteHabit,
  DELETE_HABIT_BY_DAY,
  DELETE_ENTIRE_HABIT,
  DELETE_HABIT_DOCUMENT,
} from './firebase/firestore';
import { flattenHabitItems } from './parsers/habit';
import { dateStringToObject } from './formatters/datetime';
// components
import HabitForm from './HabitForm';
import HabitOptionsForm from './HabitOptionsForm';
// constants
const TABLE_COLUMNS = ['Count', 'Time', 'Date'];
// styles
const MenuHeader = styled.section`
  display: flex;
  flex-direction: column;

  ${habitDetailsGutterPadding};
  padding-bottom: 1rem;
`;

const MenuHeaderTop = styled.section`
  display: flex;
  justify-content: space-between;
`;

const HabitLabel = styled.h3`
  margin: 0;
`;

const HabitCurrentDate = styled.h4`
  margin: 0;
`;

const MenuHeaderBottom = styled.section``;

const TitleWrapper = styled.section``;

const FormWrapper = styled.section`
  margin-top: 1rem;
`;

const MenuWrapper = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const MenuButton = styled.button`
  font-size: 1rem;
  height: 2rem;
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteRecordButton = styled(MenuButton)`
  margin: 0 auto;
`;

const DateButton = styled.button`
  ${({ isActive }) => isActive && 'background-color: #FFF'};
`;

const DeleteButton = styled.button`
  white-space: nowrap;
`;

const MenuContent = styled.section`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.2rem;
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

const TableWrapper = styled.section`
  width: 100%;
  max-height: 20rem;
  overflow: auto;
  border: 1px solid;
`;

const Table = styled.table`
  width: 100%;
  height: 100%;
  text-align: left;
  border-collapse: collapse;
`;

const Th = styled.th`
  border: 1px solid;
  border-top: none;
  padding: 0.5rem;

  &:first-of-type {
    border-left: none;
  }

  &:last-of-type {
    border-right: none;
  }

  @media ${mediaQueryDevice.mobileXL} {
    padding: 1rem;
  }
`;

const Tr = styled.tr`
  &:last-of-type {
    td {
      border-bottom: none;
    }
  }

  td {
    &:first-of-type {
      border-left: none;
    }

    &:last-of-type {
      border-right: none;
    }
  }
`;

const Td = styled.td`
  border: 1px solid;
  padding: 0.5rem;

  @media ${mediaQueryDevice.mobileXL} {
    padding: 1rem;
  }
`;

const TableCount = styled.p``;
const TableDate = styled.p``;
const TableYear = styled.p``;
const TableTime = styled.p``;
const TableAMPM = styled.p``;

const ChartWrapper = styled.section`
  width: auto;
  height: 20rem;
  user-select: none;
  display: inline-block;
  border: 1px solid;

  @media ${mediaQueryDevice.laptop} {
    width: 100%;
  }
`;

const CalendarWrapper = styled.section``;

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
  const [areDetailsShown, setAreDetailsShown] = useState(false);
  const [isChartShown, setIsChartShown] = useState(false);
  const [isCalendarShown, setIsCalendarShown] = useState(false);
  const [calendarValues, setCalendarValues] = useState([]);
  const [datesList, setDatesList] = useState([]);
  const [currentDate, setCurrentDate] = useState({
    string: '',
    object: new DateObject({
      year: 1969,
      month: 4,
      day: 20,
    }),
  });
  const [habitChartData, setHabitChartData] = useState([]);
  const [habitDocuments, setHabitDocuments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [optionsTimeRange, setOptionsTimeRange] = useState();

  const calendarRef = useRef(null);

  useEffect(() => {
    calendarRef?.current?.set('year', currentDate.object.year);
    calendarRef?.current?.set('month', currentDate.object.month);
    calendarRef?.current?.set('day', currentDate.object.day);
  }, [currentDate]);

  useEffect(() => {
    const datesList = dateOrder;
    const newDateObject = dateStringToObject(datesList[0]);

    setDatesList(datesList);
    setCurrentDate(newDateObject);
  }, [dateOrder]);

  useEffect(() => {
    const newCalendarValues = datesList.map((date) => {
      return new Date(date);
    });

    setCalendarValues(newCalendarValues);
  }, [datesList]);

  /*
  useEffect(() => {
   0: midnight - midnight
   1: 1am - 1am
   2: 2am - 2am
   3: 3am - 3am
   4: 4am - 4am
   5: 5am - 5am
   6: 6am - 6am
   7: 7am - 7am
   8: 8am - 8am
   9: 9am - 9am
   10: 10am - 10am
   11: 11am - 11am
   12: 12pm - 12pm
   13: noon - noon
   14: 1pm - 1pm
   .
   .
   .
   24: 
    setTimeRange();
  }, []);
  */

  useEffect(() => {
    const currentChartData = groupedData[currentDate.string]?.chartList || [];
    const currentTableData = groupedData[currentDate.string]?.tableList || [];
    const currentTotalCount = groupedData[currentDate.string]?.totalCount || 0;

    setHabitChartData(currentChartData);
    setHabitDocuments(currentTableData);
    setTotalCount(currentTotalCount);
  }, [currentDate, groupedData]);

  const handleToggleDetails = useCallback(() => {
    setAreDetailsShown((prev) => {
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
    const newDateObject = dateStringToObject(newDate);

    setCurrentDate(newDateObject);
  }, []);

  const toggleDetailsText = areDetailsShown ? 'hide details' : 'show details';
  const toggleChartText = isChartShown ? 'hide chart' : 'show chart';
  const toggleCalendarText = isCalendarShown
    ? 'hide calendar'
    : 'show calendar';
  const handleDeleteHabitByDay = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete all ${habitLabel} habits for ${currentDate.string}?`,
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
    currentDate,
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

  const handleMenuButtonClick = useCallback(() => {
    setIsMenuOpen((prev) => {
      return !prev;
    });
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

  const menuWrapperRef = useDetectClickOutside({
    onTriggered: () => {
      setIsMenuOpen(false);
    },
  });

  const menuButtonContent = isMenuOpen ? '✕' : '⋯';

  return (
    <section>
      <MenuHeader>
        <MenuHeaderTop>
          <TitleWrapper>
            <HabitLabel>{habitLabel}</HabitLabel>
            <HabitCurrentDate>{currentDate.string}</HabitCurrentDate>
          </TitleWrapper>
          <MenuWrapper ref={menuWrapperRef}>
            <MenuButton onClick={handleMenuButtonClick}>
              {menuButtonContent}
            </MenuButton>
            {isMenuOpen ? (
              <MenuContent>
                <DeleteButton onClick={handleDeleteHabitByDay}>
                  delete habits for {currentDate.string}
                </DeleteButton>
                <DeleteButton onClick={handleDeleteEntireHabit}>
                  delete entire habit
                </DeleteButton>
              </MenuContent>
            ) : null}
          </MenuWrapper>
        </MenuHeaderTop>
        <MenuHeaderBottom>
          <section>
            <p>options:</p>
            <HabitOptionsForm
              userID={userID}
              habitID={habitID}
              onAddHabitOption={onAddHabitOption}
            />
          </section>
          <FormWrapper>
            <HabitForm
              userID={userID}
              habitID={habitID}
              habitLabel={habitLabel}
              onAddHabit={onAddHabit}
            />
          </FormWrapper>
        </MenuHeaderBottom>
      </MenuHeader>
      <DatesContainer>
        {datesList.map((date) => {
          const isAtive = date === currentDate.string;

          return (
            <DateButton
              key={date}
              isActive={isAtive}
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
          <button onClick={handleToggleDetails}>{toggleDetailsText}</button>
          <button onClick={handleToggleChart}>{toggleChartText}</button>
          <button onClick={handleToggleCalendar}>{toggleCalendarText}</button>
        </DetailsTopContainer>
        <DetailsBottomContainer>
          {areDetailsShown ? (
            <TableWrapper>
              <Table border={1}>
                <thead>
                  <tr>
                    {TABLE_COLUMNS.map((columnName) => {
                      return <Th key={columnName}>{columnName}</Th>;
                    })}
                    <Th>Delete</Th>
                  </tr>
                </thead>
                <tbody>
                  {habitDocuments.map((habit) => {
                    const { id, count, datetime } = habit;

                    const timeString = format(datetime, 'h:mm');
                    const timeAMPMString = format(datetime, 'a');
                    const dateString = datetime.toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    });
                    const yearString = datetime.toLocaleDateString([], {
                      year: 'numeric',
                    });

                    return (
                      <Tr key={id}>
                        <Td>
                          <TableCount>{count}</TableCount>
                        </Td>
                        {/* empty array instead of locale string in first param defaults to default local */}
                        <Td>
                          <TableTime>{timeString}</TableTime>
                          <TableAMPM>{timeAMPMString}</TableAMPM>
                        </Td>
                        <Td>
                          <TableDate>{dateString}</TableDate>
                          <TableYear>{yearString}</TableYear>
                        </Td>
                        <Td>
                          <DeleteRecordButton
                            onClick={() => handleDeleteHabitRecord(habit)}>
                            x
                          </DeleteRecordButton>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          ) : null}
          {isChartShown ? (
            <ChartWrapper>
              <VictoryChart
                domainPadding={20}
                containerComponent={<VictoryZoomContainer />}>
                <VictoryBar
                  labelComponent={<VictoryTooltip />}
                  data={habitChartData}
                  x="datetime"
                  y="count"
                />
              </VictoryChart>
            </ChartWrapper>
          ) : null}
          {isCalendarShown ? (
            <CalendarWrapper>
              <Calendar
                ref={calendarRef}
                value={calendarValues}
                currentDate={currentDate.object}
                readOnly
              />
            </CalendarWrapper>
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
  onAddHabitOption: function () {
    console.warn(
      'onAddHabitOption() prop in <HabitGroup /> component called without a value',
    );
  },
};

export default HabitGroup;
