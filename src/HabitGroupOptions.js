// libraries
import PropTypes from 'prop-types';
import styled from 'styled-components';
// components
import HabitOptionsForm from './HabitOptionsForm';
// reusable styles
import {
  MenuHeader,
  MenuHeaderTop,
  HabitLabel,
  HabitCurrentDate,
  MenuButton,
  MenuHeaderBottom,
} from './styles/components';
// styles
const OptionsMenuHeaderBottom = styled(MenuHeaderBottom)`
  display: flex;
  justify-content: space-between;
`;
const DeleteButtonsWrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const DeleteButton = styled.button`
  white-space: nowrap;
`;

function HabitGroupOptions({
  userID,
  habitID,
  habitLabel,
  currentDateString,
  onAddHabitOption,
  onCloseHabitOptions,
  onDeleteHabitByDay,
  onDeleteEntireHabit,
}) {
  return (
    <MenuHeader>
      <MenuHeaderTop>
        <section>
          <HabitLabel>{habitLabel} menu</HabitLabel>
          <HabitCurrentDate>{currentDateString}</HabitCurrentDate>
        </section>
        <MenuButton onClick={onCloseHabitOptions}>✕</MenuButton>
      </MenuHeaderTop>
      <OptionsMenuHeaderBottom>
        <section>
          <p>options:</p>
          <HabitOptionsForm
            userID={userID}
            habitID={habitID}
            onAddHabitOption={onAddHabitOption}
          />
        </section>
        <DeleteButtonsWrapper>
          <DeleteButton onClick={onDeleteHabitByDay}>
            delete habits for {currentDateString}
          </DeleteButton>
          <DeleteButton onClick={onDeleteEntireHabit}>
            delete entire habit
          </DeleteButton>
        </DeleteButtonsWrapper>
      </OptionsMenuHeaderBottom>
    </MenuHeader>
  );
}

HabitGroupOptions.propTypes = {
  userID: PropTypes.string,
  habitID: PropTypes.string,
  habitLabel: PropTypes.string,
  currentDateString: PropTypes.string,
  onAddHabitOption: PropTypes.func,
  onCloseHabitOptions: PropTypes.func,
};

HabitGroupOptions.defaultProps = {
  userID: '',
  habitID: '',
  habitLabel: '',
  currentDateString: '',
  onAddHabitOption: function () {
    console.warn(
      'onAddHabitOption() prop in <HabitGroupOptions /> component called without a value',
    );
  },
  onCloseHabitOptions: function () {
    console.warn(
      'onCloseHabitOptions() prop in <HabitGroupOptions /> component called without a value',
    );
  },
  onDeleteHabitByDay: function () {
    console.warn(
      'onDeleteHabitByDay() prop in <HabitGroupOptions /> component called without a value',
    );
  },
  onDeleteEntireHabit: function () {
    console.warn(
      'onDeleteEntireHabit() prop in <HabitGroupOptions /> component called without a value',
    );
  },
};

export default HabitGroupOptions;
