// libraries
import { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { utcToZonedTime, format } from 'date-fns-tz';

// utils
import { saveHabitOptions } from './firebase/firestore';
// constants
const NEGATIVE_TIME_SHIFT_INPUT = 'negative-time-shift-input';
const FORM_INITIAL = 'form-initial';
const FORM_SUBMITTED = 'form-submitted';
const FORM_SUBMITTED_ERROR = 'form-submitted-error';

function HabitOptionsForm({ userID, onAddHabitOption, habitID }) {
  const [formSubmissionState, setFormSubmissionState] = useState(FORM_INITIAL);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [hasHabitLabel, setHasHabitLabel] = useState(false);

  useEffect(() => {
    if (formSubmissionState === FORM_SUBMITTED) {
      setIsFormDisabled(true);
    } else {
      setIsFormDisabled(false);
    }
  }, [formSubmissionState]);

  const labelInputRef = useRef(null);
  const countInputRef = useRef(null);
  const dateTimeInputRef = useRef(null);

  const clearInputs = useCallback(() => {
    const labelEl = labelInputRef?.current;
    const countEl = countInputRef?.current;
    countEl.value = '';
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setFormSubmissionState(FORM_SUBMITTED);

      const isFormValid = event.target.checkValidity();
      if (isFormValid) {
        const label = habitLabel || labelInputRef?.current?.value;
        const count = Number(countInputRef?.current?.value);

        saveHabitOptions({ userID, habitID, habitOptionsID, negativeTimeShift })
          .then((response) => {
            onAddHabit(userID);
            setFormSubmissionState(FORM_INITIAL);
            clearInputs();
          })
          .catch((error) => {
            console.error('error saving habit', error.message);
            setFormSubmissionState(FORM_SUBMITTED_ERROR);
          });
      }
    },
    [onAddHabitOption, userID, clearInputs, habitID],
  );

  return (
    <section>
      <form id={`habit-form-${habitLabel || 'main'}`} onSubmit={handleSubmit}>
        <input
          ref={countInputRef}
          id={COUNT_INPUT_ID}
          name="habit-count"
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

HabitForm.propTypes = {
  userID: PropTypes.string,
  onAddHabit: PropTypes.func,
  habitLabel: PropTypes.string,
  habitID: PropTypes.string,
};

HabitForm.defaultProps = {
  userID: '',
  habitLabel: '',
  habitID: '',
  onAddHabit: function () {
    console.warn(
      'onAddHabit() prop in <HabitForm /> component called without a value',
    );
  },
};

export default HabitForm;
