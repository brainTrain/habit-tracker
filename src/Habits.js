// libraries
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import groupBy from 'lodash/groupBy';
import { VictoryBar, VictoryChart, VictoryTooltip } from 'victory';
// utils
import { fetchHabits } from './firebase/firestore';
import { appGutterPadding } from './styles/layout';
// components
import HabitGroup from './HabitGroup';
import HabitsForm from './HabitsForm';
// constants
const HABITS_LOADING = 'habits-loading';
const HABITS_LOADED = 'habits-loaded';
const HABITS_LOADED_ERROR = 'habits-loaded-error';
// styles
const ChartWrapper = styled.div`
  width: 100%;
  height: 20rem;
`;

const HabitWrapper = styled.article`
  border: 1px solid;
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 0.2rem;
`;

const PageWrapper = styled.section`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const AppHeader = styled.header`
  ${appGutterPadding};

  border-bottom: 1px solid;
  display: flex;
  flex-direction: column;
`;

const AppHeaderTopSection = styled.section`
  display: felx;
  align-items: center;
  justify-content: space-between;
`;

const HabitFormWrapper = styled.section`
  padding: 1rem;
`;

const ContentWrapper = styled.section`
  ${appGutterPadding};

  padding-top: 2rem;
  height: 100%;
  overflow: auto;
`;

function Habits({ userID, userEmail, onLogout }) {
  const [habitsGroups, setHabitsGroups] = useState({});
  const [habitsChartDataGroups, setHabitsChartDataGroups] = useState({});
  const [habitsLoadState, setHabitsLoadState] = useState(HABITS_LOADING);

  const handleFetchHabits = useCallback(() => {
    fetchHabits(userID)
      .then((habitsResponse) => {
        let newHabits = [];
        let newHabitsChartData = [];
        habitsResponse.forEach((doc) => {
          const { count, datetime, habitLabel, publicID } = doc.data();
          const parsedCount = Number(count);
          const newHabit = {
            count: parsedCount,
            datetime: datetime.toDate(),
            habitLabel,
            publicID,
            id: doc.id,
          };
          newHabits = [...newHabits, { ...newHabit }];

          const newHabitChartData = {
            habitLabel,
            count: parsedCount,
            datetime: datetime.toDate(),
            label: `${count} at ${datetime.toDate().toLocaleTimeString()}`,
          };

          newHabitsChartData = [
            ...newHabitsChartData,
            { ...newHabitChartData },
          ];
        });

        const simpleGroupByHabits = groupBy(newHabits, 'habitLabel');
        let newGroupByHabits = {};
        Object.keys(simpleGroupByHabits).forEach((habitKey) => {
          const data =
            simpleGroupByHabits[habitKey].sort((a, b) => {
              return b?.datetime?.getTime() - a?.datetime?.getTime();
            }) || [];

          const totalCount = data.reduce((previousCount, { count }) => {
            return previousCount + count;
          }, 0);

          newGroupByHabits[habitKey] = {
            totalCount,
            habitLabel: habitKey,
            data,
          };
        });

        setHabitsGroups(newGroupByHabits);
        setHabitsChartDataGroups(groupBy(newHabitsChartData, 'habitLabel'));

        setHabitsLoadState(HABITS_LOADED);
      })
      .catch((error) => {
        console.error('error fetching habits', error);
        setHabitsLoadState(HABITS_LOADED_ERROR);
      });
  }, [userID]);

  // TODO: make this header section its own component and raise it up a level broooooo
  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  const handleDeleteHabit = useCallback(() => {
    handleFetchHabits();
  }, [handleFetchHabits]);

  useEffect(() => {
    handleFetchHabits();
  }, [handleFetchHabits]);

  return (
    <PageWrapper>
      <AppHeader>
        <AppHeaderTopSection>
          <h1>Habits for {userEmail}</h1>
          <button onClick={handleLogout}>logout</button>
        </AppHeaderTopSection>
        <HabitFormWrapper>
          <HabitsForm userID={userID} onAddHabit={handleFetchHabits} />
        </HabitFormWrapper>
      </AppHeader>
      <ContentWrapper>
        {{
          [HABITS_LOADING]: <p>loading...</p>,
          [HABITS_LOADED_ERROR]: <p>Error loading habits.</p>,
          [HABITS_LOADED]: (
            <section>
              {Object.keys(habitsGroups).map((habitKey) => {
                const habit = habitsGroups[habitKey];
                return (
                  <HabitWrapper key={habitKey}>
                    <HabitGroup
                      userID={userID}
                      totalCount={habit?.totalCount}
                      habitLabel={habitKey}
                      habitsList={habit?.data}
                      onDeleteHabit={handleDeleteHabit}
                      onAddHabit={handleFetchHabits}
                    />
                    <ChartWrapper>
                      <VictoryChart domainPadding={20}>
                        <VictoryBar
                          labelComponent={<VictoryTooltip />}
                          data={habitsChartDataGroups[habitKey]}
                          x="datetime"
                          y="count"
                        />
                      </VictoryChart>
                    </ChartWrapper>
                  </HabitWrapper>
                );
              })}
            </section>
          ),
        }[habitsLoadState] || <p>Error loading habits.</p>}
      </ContentWrapper>
    </PageWrapper>
  );
}

Habits.propTypes = {
  userID: PropTypes.string,
  userEmail: PropTypes.string,
  onLogout: PropTypes.func,
};

Habits.defaultProps = {
  userID: '',
  userEmail: '',
  onLogout: function () {
    console.warn(
      'onLogout() prop in <Habits /> component called without a value',
    );
  },
};

export default Habits;
