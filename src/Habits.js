import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import groupBy from 'lodash/groupBy';
import { VictoryBar, VictoryChart, VictoryTooltip } from 'victory';

import { saveHabit, fetchHabits } from './firebase/firestore';

import HabitGroup from './HabitGroup';

const LABEL_INPUT_ID = 'habit-label-input';
const COUNT_INPUT_ID = 'habit-count-input';

const ChartWrapper = styled.div`
  width: 100%;
  height: 20rem;
  border: 1px solid red;
`;

const HabitWrapper = styled.article`
  border: 1px solid;
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 0.2rem;
`;

function Habits({ userID, userEmail }) {
  const [habitsGroups, setHabitsGroups] = useState({});
  const [habitsChartDataGroups, setHabitsChartDataGroups] = useState({});

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

        setHabitsGroups(groupBy(newHabits, 'habitLabel'));
        setHabitsChartDataGroups(groupBy(newHabitsChartData, 'habitLabel'));

        clearInputs();
      })
      .catch((error) => {
        console.error('error fetching habits', error);
      });
  }, [userID, clearInputs]);

  useEffect(() => {
    handleFetchHabits();
  }, [handleFetchHabits]);

  const handleSubmit = (event) => {
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
  };

  return (
    <div>
      <h1>Habits for {userEmail}</h1>
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
      <section>
        {Object.keys(habitsGroups).map((habitKey) => {
          console.log(
            'habitsChartDataGroups[habitKey]',
            habitsChartDataGroups[habitKey],
          );
          return (
            <HabitWrapper key={habitKey}>
              <HabitGroup
                habitLabel={habitKey}
                habitsList={habitsGroups[habitKey]}
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
    </div>
  );
}

export default Habits;
