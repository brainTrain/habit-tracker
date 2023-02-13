// libraries
import { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

// utils
import { saveHabitOptions } from './firebase/firestore';
import { HABIT_OPTION_EMPTY } from './parsers/habit';
// constants
const NEGATIVE_TIME_SHIFT_INPUT = 'negative-time-shift-input';
const FORM_INITIAL = 'form-initial';
const FORM_SUBMITTED = 'form-submitted';
const FORM_SUBMITTED_ERROR = 'form-submitted-error';

function HabitOptionsForm({ userID, onAddHabitOption, habitID, habitOptions }) {
  const [formSubmissionState, setFormSubmissionState] = useState(FORM_INITIAL);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  useEffect(() => {
    if (formSubmissionState === FORM_SUBMITTED) {
      setIsFormDisabled(true);
    } else {
      setIsFormDisabled(false);
    }
  }, [formSubmissionState]);

  const negativeTimeShiftRef = useRef(null);

  const clearInputs = useCallback(() => {
    const negativeTimeShiftEl = negativeTimeShiftRef?.current;
    negativeTimeShiftEl.value = '';
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setFormSubmissionState(FORM_SUBMITTED);

      const isFormValid = event.target.checkValidity();
      if (isFormValid) {
        const negativeTimeShift = Number(negativeTimeShiftRef?.current?.value);

        saveHabitOptions({
          userID,
          habitID,
          habitOptionsID: habitOptions.habitOptionsID,
          negativeTimeShift,
        })
          .then((response) => {
            onAddHabitOption();
            setFormSubmissionState(FORM_INITIAL);
            clearInputs();
          })
          .catch((error) => {
            console.error('error saving habit', error.message);
            setFormSubmissionState(FORM_SUBMITTED_ERROR);
          });
      }
    },
    [onAddHabitOption, userID, clearInputs, habitID, habitOptions],
  );

  return (
    <section>
      <form id={`habit-form-${habitID || 'main'}`} onSubmit={handleSubmit}>
        <input
          ref={negativeTimeShiftRef}
          id={NEGATIVE_TIME_SHIFT_INPUT}
          name={NEGATIVE_TIME_SHIFT_INPUT}
          type="number"
          placeholder={'negative time shift in hours'}
          min={0}
          required
        />
        <button type="submit" disabled={isFormDisabled}>
          submit habit
        </button>
      </form>
    </section>
  );
}

HabitOptionsForm.propTypes = {
  userID: PropTypes.string,
  habitID: PropTypes.string,
  onAddHabit: PropTypes.func,
  // TODO: define shape
  habitOptions: PropTypes.object,
};

HabitOptionsForm.defaultProps = {
  userID: '',
  habitID: '',
  habitOptions: { ...HABIT_OPTION_EMPTY },
  onAddHabitOption: function () {
    console.warn(
      'onAddHabitOption() prop in <HabitOptionsForm /> component called without a value',
    );
  },
};

export default HabitOptionsForm;
