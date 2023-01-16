// libraries
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import groupBy from 'lodash/groupBy';
import { VictoryBar, VictoryChart, VictoryTooltip } from 'victory';
// utils
import { fetchHabits, saveHabit } from './firebase/firestore';
import { appGutterPadding } from './styles/layout';
// components
import HabitGroup from './HabitGroup';
// constants
const COUNT_INPUT_ID = 'habit-count-input';
const LABEL_INPUT_ID = 'habit-label-input';
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

  const labelInputRef = useRef(null);
  const countInputRef = useRef(null);

  const clearInputs = useCallback(() => {
    const labelEl = labelInputRef?.current;
    const countEl = countInputRef?.current;

    labelEl.value = '';
    countEl.value = '';
  }, []);

  const handleFetchHabits = useCallback(() => {
    fetchHabits(userID)
      .then((habitsResponse) => {
        let newHabits = [];
        let newHabitsChartData = [];
        habitsResponse.forEach((doc) => {
          const { count, datetime, habitLabel } = doc.data();
          const newHabit = {
            count,
            datetime: datetime.toDate(),
            habitLabel,
            id: doc.id,
          };
          newHabits = [...newHabits, { ...newHabit }];

          const newHabitChartData = {
            habitLabel,
            count,
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
          const data = simpleGroupByHabits[habitKey] || [];

          const totalCount = data.reduce((previousCount, { count }) => {
            return previousCount + Number(count);
          }, 0);

          newGroupByHabits[habitKey] = {
            totalCount,
            habitLabel: habitKey,
            data,
          };
        });
        setHabitsGroups(newGroupByHabits);
        setHabitsChartDataGroups(groupBy(newHabitsChartData, 'habitLabel'));

        clearInputs();
        setHabitsLoadState(HABITS_LOADED);
      })
      .catch((error) => {
        console.error('error fetching habits', error);
        setHabitsLoadState(HABITS_LOADED_ERROR);
      });
  }, [userID, clearInputs]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const isFormValid = event.target.checkValidity();
      if (isFormValid) {
        const label = labelInputRef?.current?.value;
        const count = countInputRef?.current?.value;

        saveHabit(label, count, userID)
          .then((response) => {
            handleFetchHabits(userID);
          })
          .catch((error) => {
            console.error('error saving habit');
          });
      }
    },
    [handleFetchHabits, userID],
  );

  // TODO: make this header section its own component and raise it up a level broooooo
  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

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
          <form id="habit-form" onSubmit={handleSubmit}>
            <input
              ref={labelInputRef}
              id={LABEL_INPUT_ID}
              name="habit-label"
              placeholder="Habit label"
              required
            />
            <input
              ref={countInputRef}
              id={COUNT_INPUT_ID}
              name="habit-count"
              type="number"
              placeholder="Habit count"
              min={0}
              required
            />
            <button type="submit">submit habit</button>
          </form>
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
                      totalCount={habit?.totalCount}
                      habitLabel={habitKey}
                      habitsList={habit?.data}
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

export default Habits;
