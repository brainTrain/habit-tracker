// libraries
import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDetectClickOutside } from 'react-detect-click-outside';
import {
  VictoryBar,
  VictoryChart,
  VictoryTooltip,
  VictoryZoomContainer,
} from 'victory';
// utils
import { habitDetailsGutterPadding } from './styles/layout';
import { deleteHabit } from './firebase/firestore';
import { flattenHabitItems } from './parsers/habit';
import { HABIT_OPTION_EMPTY } from './firebase/models';
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
  margin-left: auto;
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

const DatesContainer = styled.div`
  width: 100%;
  overflow: auto;
  display: flex;
  gap: 0.5rem;

  ${habitDetailsGutterPadding};
  padding-bottom: 0.5rem;
`;

const TableWrapper = styled.section`
  width: 100%;
  max-height: 20rem;
  overflow: auto;
  border-top: 1px solid;
  border-bottom: 1px solid;
`;

const Table = styled.table`
  width: 100%;
  text-align: left;
  border-collapse: collapse;
`;

const Th = styled.th`
  border: 1px solid;
  border-top: none;
  padding: 0.5rem;
`;

const Tr = styled.tr`
  &:last-of-type {
    td {
      border-bottom: none;
    }
  }
`;

const Td = styled.td`
  border: 1px solid;
  padding: 0.5rem;
`;

const ChartWrapper = styled.section`
  width: auto;
  height: 20rem;
  user-select: none;
  display: inline-block;
  border: 1px solid;
`;

const DetailsTopContainer = styled.section`
  width: 100%;
`;

const DetailsBottomContainer = styled.section`
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

function HabitGroup({
  groupedData,
  habitOptions,
  dateOrder,
  habitID,
  habitLabel,
  onAddHabit,
  onDeleteHabit,
  userID,
}) {
  const [areDetailsShown, setAreDetailsShown] = useState(false);
  const [isChartShown, setIsChartShown] = useState(false);
  const [datesList, setDatesList] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [habitChartData, setHabitChartData] = useState([]);
  const [habitItems, setHabitItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const datesList = dateOrder;
    setDatesList(datesList);
    setCurrentDate(datesList[0]);
  }, [dateOrder]);

  useEffect(() => {
    const currentChartData = groupedData[currentDate]?.chartList || [];
    const currentTableData = groupedData[currentDate]?.tableList || [];
    const currentTotalCount = groupedData[currentDate]?.totalCount || 0;

    setHabitChartData(currentChartData);
    setHabitItems(currentTableData);
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

  const handleDateButtonClick = useCallback((newDate) => {
    setCurrentDate(newDate);
  }, []);

  const toggleDetailsText = areDetailsShown ? 'hide details' : 'show details';
  const toggleChartText = isChartShown ? 'hide chart' : 'show chart';
  const handleDeleteHabitByDay = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete all ${habitLabel} habits for ${currentDate}?`,
      )
    ) {
      deleteHabit(habitItems)
        .then(() => {
          onDeleteHabit();
          setIsMenuOpen(false);
        })
        .catch((error) => {
          console.error('error deleting habit', error);
        });
    }
  }, [habitLabel, habitItems, onDeleteHabit, currentDate]);

  const handleDeleteEntireHabit = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete this entire ${habitLabel} habit?`,
      )
    ) {
      const flatHabit = flattenHabitItems(groupedData);

      deleteHabit(flatHabit)
        .then(() => {
          onDeleteHabit();
          setIsMenuOpen(false);
        })
        .catch((error) => {
          console.error('error deleting habit', error);
        });
    }
  }, [habitLabel, groupedData, onDeleteHabit]);

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
            onDeleteHabit();
          })
          .catch((error) => {
            console.error('error deleting habit record', error);
          });
      }
    },
    [onDeleteHabit],
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
            <HabitCurrentDate>{currentDate}</HabitCurrentDate>
          </TitleWrapper>
          <MenuWrapper ref={menuWrapperRef}>
            <MenuButton onClick={handleMenuButtonClick}>
              {menuButtonContent}
            </MenuButton>
            {isMenuOpen ? (
              <MenuContent>
                <DeleteButton onClick={handleDeleteHabitByDay}>
                  delete habits for {currentDate}
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
            <span>options:</span>
            <HabitOptionsForm
              userID={userID}
              habitID={habitID}
              habitOptions={habitOptions}
              onAddHabitOption={onAddHabit}
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
          const isAtive = date === currentDate;
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
                  {habitItems.map((habit) => {
                    const { id, count, datetime } = habit;
                    return (
                      <Tr key={id}>
                        <Td>{count}</Td>
                        <Td>{datetime.toLocaleTimeString()}</Td>
                        <Td>{datetime.toLocaleDateString()}</Td>
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
        </DetailsBottomContainer>
      </DetailsContainer>
    </section>
  );
}

HabitGroup.propTypes = {
  // TODO: define shape
  groupedData: PropTypes.object,
  habitOptions: PropTypes.object,
  habitID: PropTypes.string,
  habitLabel: PropTypes.string,
  dateOrder: PropTypes.array,
  onAddHabit: PropTypes.func,
  onDeleteHabit: PropTypes.func,
  userID: PropTypes.string,
};

HabitGroup.defaultProps = {
  // TODO: set empty values for keys here
  groupedData: {},
  habitOptions: { ...HABIT_OPTION_EMPTY },
  habitID: '',
  habitLabel: '',
  dateOrder: [],
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
  userID: '',
};

export default HabitGroup;
