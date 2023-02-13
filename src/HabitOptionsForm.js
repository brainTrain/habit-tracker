// libraries
import { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

// utils
import { saveHabitOptions } from './firebase/firestore';
import { HABIT_OPTION_EMPTY } from './parsers/habit';
// constants
const NEGATIVE_TIME_OFFSET_INPUT = 'negative-time-offset-input';
const FORM_INITIAL = 'form-initial';
const FORM_SUBMITTED = 'form-submitted';
const FORM_SUBMITTED_ERROR = 'form-submitted-error';

function HabitOptionsForm({ userID, onAddHabitOption, habitID, habitOptions }) {
  const [formSubmissionState, setFormSubmissionState] = useState(FORM_INITIAL);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [negativeTimeOffset, setNegativeTimeOffset] = useState(
    Number(habitOptions.negativeTimeOffset),
  );

  useEffect(() => {
    if (formSubmissionState === FORM_SUBMITTED) {
      setIsFormDisabled(true);
    } else {
      setIsFormDisabled(false);
    }
  }, [formSubmissionState]);

  const handleNegativeTimeOffsetChange = useCallback((event) => {
    const newNegativeTimeOffset = event?.target?.value || 0;

    setNegativeTimeOffset(newNegativeTimeOffset);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setFormSubmissionState(FORM_SUBMITTED);

      const isFormValid = event.target.checkValidity();
      if (isFormValid) {
        saveHabitOptions({
          userID,
          habitID,
          habitOptionsID: habitOptions.habitOptionsID,
          negativeTimeOffset,
        })
          .then((response) => {
            onAddHabitOption();
            setFormSubmissionState(FORM_INITIAL);
          })
          .catch((error) => {
            console.error('error saving habit', error.message);
            setFormSubmissionState(FORM_SUBMITTED_ERROR);
          });
      }
    },
    [onAddHabitOption, userID, habitID, habitOptions],
  );

  return (
    <section>
      <form id={`habit-options-form-${habitID}`} onSubmit={handleSubmit}>
        <input
          id={NEGATIVE_TIME_OFFSET_INPUT}
          name={NEGATIVE_TIME_OFFSET_INPUT}
          value={negativeTimeOffset}
          onChange={handleNegativeTimeOffsetChange}
          type="number"
          placeholder={'negative time shift in hours'}
          min={0}
          required
        />
        <button type="submit" disabled={isFormDisabled}>
          submit habit options
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
