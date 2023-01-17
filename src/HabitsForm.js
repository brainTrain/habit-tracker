// libraries
import { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
// utils
import { saveHabit } from './firebase/firestore';
// constants
const COUNT_INPUT_ID = 'habit-count-input';
const LABEL_INPUT_ID = 'habit-label-input';
const FORM_INITIAL = 'form-initial';
const FORM_SUBMITTED = 'form-submitted';
const FORM_SUBMITTED_ERROR = 'form-submitted-error';

function HabitsForm({ userID, onFetchHabits }) {
  const [formSubmissionState, setFormSubmissionState] = useState(FORM_INITIAL);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  useEffect(() => {
    if (formSubmissionState === FORM_SUBMITTED) {
      setIsFormDisabled(true);
    } else {
      setIsFormDisabled(false);
    }
  }, [formSubmissionState]);

  const labelInputRef = useRef(null);
  const countInputRef = useRef(null);

  const clearInputs = useCallback(() => {
    const labelEl = labelInputRef?.current;
    const countEl = countInputRef?.current;

    labelEl.value = '';
    countEl.value = '';
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setFormSubmissionState(FORM_SUBMITTED);

      const isFormValid = event.target.checkValidity();
      if (isFormValid) {
        const label = labelInputRef?.current?.value;
        const count = Number(countInputRef?.current?.value);

        saveHabit(label, count, userID)
          .then((response) => {
            onFetchHabits(userID);
            setFormSubmissionState(FORM_INITIAL);
            clearInputs();
          })
          .catch((error) => {
            console.error('error saving habit', error.message);
            setFormSubmissionState(FORM_SUBMITTED_ERROR);
          });
      }
    },
    [onFetchHabits, userID, clearInputs],
  );

  return (
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
      <button type="submit" disabled={isFormDisabled}>
        submit habit
      </button>
    </form>
  );
}

HabitsForm.propTypes = {
  userID: PropTypes.string,
  onFetchHabits: PropTypes.func,
};

HabitsForm.defaultProps = {
  userID: '',
  onFetchHabits: function () {
    console.warn(
      'onFetchHabits() prop in <HabitsForm /> component called without a value',
    );
  },
};

export default HabitsForm;
