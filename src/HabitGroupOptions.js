// libraries
import PropTypes from 'prop-types';
import styled from 'styled-components';
// components
import RefreshHabitButton from './RefreshHabitButton';
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
const MenuHeaderRight = styled.section`
  display: flex;
`;
const OptionsMenuHeaderBottom = styled(MenuHeaderBottom)`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
`;
const DeleteButtonsWrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
        <MenuHeaderRight>
          <RefreshHabitButton habitID={habitID} userID={userID} />
          <MenuButton onClick={onCloseHabitOptions}>✕</MenuButton>
        </MenuHeaderRight>
      </MenuHeaderTop>
      <OptionsMenuHeaderBottom>
        <HabitOptionsForm
          userID={userID}
          habitID={habitID}
          onAddHabitOption={onAddHabitOption}
        />
        <DeleteButtonsWrapper>
          <button onClick={onDeleteHabitByDay}>
            delete habits for {currentDateString}
          </button>
          <button onClick={onDeleteEntireHabit}>delete entire habit</button>
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
