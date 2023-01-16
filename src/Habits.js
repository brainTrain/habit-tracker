import { useState, useEffect, useRef } from 'react';
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import { saveHabit, fetchHabits } from './firebase/firestore';

import HabitGroup from './HabitGroup';

const LABEL_INPUT_ID = 'habit-label-input';
const COUNT_INPUT_ID = 'habit-count-input';

function Habits({ userID, userEmail }) {
  const [habitsGroups, setHabitsGroups] = useState({});

  const labelInputRef = useRef(null);
  const countInputRef = useRef(null);

  const clearInputs = () => {
    const labelEl = labelInputRef?.current;
    const countEl = countInputRef?.current;

    labelEl.value = '';
    countEl.value = '';
  };

  const handleFetchHabits = () => {
    const fetchedHabits = fetchHabits(userID)
      .then((habitsResponse) => {
        const newHabits = [];
        habitsResponse.forEach((doc) => {
          const { count, datetime, habitLabel } = doc.data();
          newHabits.push({
            count,
            datetime: datetime.toDate(),
            habitLabel,
            id: doc.id,
          });
        });
        setHabitsGroups(groupBy(newHabits, 'habitLabel'));
        clearInputs();
      })
      .catch((error) => {
        console.error('error fetching habits', error);
      });
  };

  useEffect(() => {
    handleFetchHabits();
  }, []);

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
          return (
            <HabitGroup
              key={habitKey}
              habitLabel={habitKey}
              habitsList={habitsGroups[habitKey]}
            />
          );
        })}
      </section>
    </div>
  );
}

export default Habits;
