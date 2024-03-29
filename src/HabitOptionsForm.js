// libraries
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
// utils
import { saveHabitOptions } from './firebase/firestore';
import { HABIT_OPTION_EMPTY } from './firebase/models';
import { minutesToHours, hoursToMinutes } from './formatters/datetime';
// redux
import { selectHabitOptionsByID } from './redux/habit-options';
// constants
const NEGATIVE_TIME_OFFSET_INPUT = 'negative-time-offset-input';
const FORM_INITIAL = 'form-initial';
const FORM_SUBMITTED = 'form-submitted';
const FORM_SUBMITTED_ERROR = 'form-submitted-error';
// styles
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

function HabitOptionsForm({ userID, onAddHabitOption, habitID }) {
  // redux props
  const habitOptions = useSelector((state) =>
    selectHabitOptionsByID(state, habitID),
  );
  // local state
  const [formSubmissionState, setFormSubmissionState] = useState(FORM_INITIAL);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  const [negativeTimeOffset, setNegativeTimeOffset] = useState(
    minutesToHours(Number(habitOptions?.negativeTimeOffset || 0)),
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
      const formattedNegativeTimeOffset = hoursToMinutes(negativeTimeOffset);

      const newHabitOptions = {
        negativeTimeOffset: formattedNegativeTimeOffset,
      };

      const isFormValid = event.target.checkValidity();
      if (isFormValid) {
        const { id, habitOptionsID } = habitOptions;

        saveHabitOptions({
          id,
          habitOptionsID,
          userID,
          habitID,
          habitOptions: newHabitOptions,
        })
          .then((response) => {
            onAddHabitOption(response);
            setFormSubmissionState(FORM_INITIAL);
          })
          .catch((error) => {
            console.error('error saving habit', error.message);
            setFormSubmissionState(FORM_SUBMITTED_ERROR);
          });
      }
    },
    [onAddHabitOption, userID, habitID, habitOptions, negativeTimeOffset],
  );

  return (
    <section>
      <Form id={`habit-options-form-${habitID}`} onSubmit={handleSubmit}>
        <label htmlFor={NEGATIVE_TIME_OFFSET_INPUT}>Hours Offset</label>
        <input
          id={NEGATIVE_TIME_OFFSET_INPUT}
          name={NEGATIVE_TIME_OFFSET_INPUT}
          value={negativeTimeOffset}
          onChange={handleNegativeTimeOffsetChange}
          type="number"
          placeholder={'negative time shift in hours'}
          min={0}
          step={0.5}
          required
        />
        <button type="submit" disabled={isFormDisabled}>
          submit habit options
        </button>
      </Form>
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
