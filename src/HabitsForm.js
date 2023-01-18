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
const COUNT_INPUT_BASE_COPY = 'Habit count';

function HabitsForm({ userID, onAddHabit, habitLabel }) {
  const [formSubmissionState, setFormSubmissionState] = useState(FORM_INITIAL);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [hasHabitLabel, setHasHabitLabel] = useState(false);

  useEffect(() => {
    setHasHabitLabel(Boolean(habitLabel));
  }, [habitLabel]);

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
    // TODO: this is a big magical right now, we're conditionally
    // rendering this form field so we can have a generic/global
    // form for creation/edit and a simpler form on the habit
    // detail view what we should really do is figure out how we
    // can have multiple forms share the same validation/styles etc
    if (!hasHabitLabel) {
      labelEl.value = '';
    }
    countEl.value = '';
  }, [hasHabitLabel]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setFormSubmissionState(FORM_SUBMITTED);

      const isFormValid = event.target.checkValidity();
      if (isFormValid) {
        const label = habitLabel || labelInputRef?.current?.value;
        const count = Number(countInputRef?.current?.value);
        console.log('label', label);
        console.log('count', count);
        console.log('userID', userID);

        saveHabit(label, count, userID)
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
    [onAddHabit, userID, clearInputs, habitLabel],
  );

  const habitCountPlaceholder = hasHabitLabel
    ? `${habitLabel} ${COUNT_INPUT_BASE_COPY}`
    : COUNT_INPUT_BASE_COPY;

  return (
    <form id={`habit-form-${habitLabel || 'main'}`} onSubmit={handleSubmit}>
      {!hasHabitLabel ? (
        <input
          ref={labelInputRef}
          id={LABEL_INPUT_ID}
          name="habit-label"
          placeholder="Habit label"
          required
        />
      ) : null}
      <input
        ref={countInputRef}
        id={COUNT_INPUT_ID}
        name="habit-count"
        type="number"
        placeholder={habitCountPlaceholder}
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
  onAddHabit: PropTypes.func,
  habitLabel: PropTypes.string,
};

HabitsForm.defaultProps = {
  userID: '',
  habitLabel: '',
  onAddHabit: function () {
    console.warn(
      'onAddHabit() prop in <HabitsForm /> component called without a value',
    );
  },
};

export default HabitsForm;
