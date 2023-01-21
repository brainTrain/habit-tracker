// libraries
import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDetectClickOutside } from 'react-detect-click-outside';
import { VictoryBar, VictoryChart, VictoryTooltip } from 'victory';
// utils
import { habitDetailsGutterPadding } from './styles/layout';
import { deleteHabit } from './firebase/firestore';
// components
import HabitsForm from './HabitsForm';
// constants
const TABLE_COLUMNS = ['Count', 'Time', 'Date'];
// styles
const MenuHeader = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${habitDetailsGutterPadding};
`;

const FormWrapper = styled.section`
  padding: 1rem;
`;

const MenuWrapper = styled.section`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MenuButton = styled.button`
  cursor: pointer;
  font-size: 1rem;
  height: 2rem;
  width: 2rem;
`;

const DeleteButton = styled.button`
  cursor: pointer;
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
`;

const DetailsContainer = styled.section`
  ${habitDetailsGutterPadding};
  border-top: 1px solid;
  border-bottom: 1px solid;

  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const DatesContainer = styled.div`
  width: 100%;
  overflow: auto;
  display: flex;
  gap: 0.5rem;
`;

const TableWrapper = styled.section`
  width: 100%;
  max-height: 20rem;
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  text-align: left;
  border: 1px solid;
  border-collapse: collapse;
`;

const Th = styled.th`
  border: 1px solid;
  padding: 0.5rem;
`;

const Td = styled.td`
  border: 1px solid;
  padding: 0.5rem;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 20rem;
`;

function HabitGroup({
  habitData,
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
  const [habitsList, setHabitsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const datesList = habitData.dateOrder || [];
    setDatesList(datesList);
    setCurrentDate(datesList[0]);
  }, [habitData.dateOrder]);

  useEffect(() => {
    const currentChartData = habitData?.data[currentDate]?.chartList || [];
    const currentTableData = habitData?.data[currentDate]?.tableList || [];
    const currentTotalCount = habitData?.data[currentDate]?.totalCount || 0;

    setHabitChartData(currentChartData);
    setHabitsList(currentTableData);
    setTotalCount(currentTotalCount);
  }, [currentDate, habitData?.data]);

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
  const handleDeleteLabel = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete this entire ${habitLabel} habit?`,
      )
    ) {
      deleteHabit(habitsList)
        .then(() => {
          onDeleteHabit(habitsList);
        })
        .catch((error) => {
          console.error('error deleting habit', error);
        });
    }
  }, [habitLabel, habitsList, onDeleteHabit]);

  const handleMenuButtonClick = useCallback(() => {
    setIsMenuOpen((prev) => {
      return !prev;
    });
  }, []);

  const menuWrapperRef = useDetectClickOutside({
    onTriggered: () => {
      setIsMenuOpen(false);
    },
  });

  const menuButtonContent = isMenuOpen ? '✕' : '⋯';

  return (
    <section>
      <MenuHeader>
        <h3>{habitLabel}</h3>
        <FormWrapper>
          <HabitsForm
            userID={userID}
            habitLabel={habitLabel}
            onAddHabit={onAddHabit}
          />
        </FormWrapper>
        <MenuWrapper ref={menuWrapperRef}>
          <MenuButton onClick={handleMenuButtonClick}>
            {menuButtonContent}
          </MenuButton>
          {isMenuOpen ? (
            <MenuContent>
              <DeleteButton onClick={handleDeleteLabel}>
                delete habit
              </DeleteButton>
            </MenuContent>
          ) : null}
        </MenuWrapper>
      </MenuHeader>
      <DatesContainer>
        {datesList.map((date) => {
          return (
            <button
              key={date}
              onClick={() => {
                handleDateButtonClick(date);
              }}>
              {date}
            </button>
          );
        })}
      </DatesContainer>
      <DetailsContainer>
        <p>total: {totalCount}</p>
        <button onClick={handleToggleDetails}>{toggleDetailsText}</button>
        {areDetailsShown ? (
          <TableWrapper>
            <Table border={1}>
              <thead>
                <tr>
                  {TABLE_COLUMNS.map((columnName) => {
                    return <Th key={columnName}>{columnName}</Th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {habitsList.map((habit) => {
                  const { id, count, datetime } = habit;
                  return (
                    <tr key={id}>
                      <Td>{count}</Td>
                      <Td>{datetime.toLocaleTimeString()}</Td>
                      <Td>{datetime.toLocaleDateString()}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        ) : null}
        <button onClick={handleToggleChart}>{toggleChartText}</button>
        {isChartShown ? (
          <ChartWrapper>
            <VictoryChart domainPadding={20}>
              <VictoryBar
                labelComponent={<VictoryTooltip />}
                data={habitChartData}
                x="datetime"
                y="count"
              />
            </VictoryChart>
          </ChartWrapper>
        ) : null}
      </DetailsContainer>
    </section>
  );
}

HabitGroup.propTypes = {
  // TODO: defined shape
  habitData: PropTypes.object,
  habitLabel: PropTypes.string,
  onAddHabit: PropTypes.func,
  onDeleteHabit: PropTypes.func,
  userID: PropTypes.string,
};

HabitGroup.defaultProps = {
  // TODO: set empty values for keys here
  habitData: {},
  habitLabel: '',
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
