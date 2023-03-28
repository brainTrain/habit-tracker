// libraries
import PropTypes from 'prop-types';
// components
import HabitForm from './HabitForm';
// reusable styles
import {
  MenuHeader,
  MenuHeaderTop,
  HabitLabel,
  HabitCurrentDate,
  MenuButton,
  MenuHeaderBottom,
} from './styles/components';

function HabitGroupHeader({
  userID,
  habitID,
  onAddHabitOption,
  habitLabel,
  currentDateString,
  onAddHabit,
  onOpenHabitOptions,
}) {
  return (
    <MenuHeader>
      <MenuHeaderTop>
        <section>
          <HabitLabel>{habitLabel}</HabitLabel>
          <HabitCurrentDate>{currentDateString}</HabitCurrentDate>
        </section>
        <MenuButton onClick={onOpenHabitOptions}>⋯</MenuButton>
      </MenuHeaderTop>
      <MenuHeaderBottom>
        <HabitForm
          userID={userID}
          habitID={habitID}
          habitLabel={habitLabel}
          onAddHabit={onAddHabit}
        />
      </MenuHeaderBottom>
    </MenuHeader>
  );
}

HabitGroupHeader.propTypes = {
  habitLabel: PropTypes.string,
  currentDateString: PropTypes.string,
  onOpenHabitOptions: PropTypes.func,
  onAddHabit: PropTypes.func,
};

HabitGroupHeader.defaultProps = {
  habitLabel: '',
  currentDateString: '',
  onOpenHabitOptions: function () {
    console.warn(
      'onOpenHabitOptions() prop in <HabitGroupHeader /> component called without a value',
    );
  },
  onAddHabitOption: function () {
    console.warn(
      'onAddHabitOption() prop in <HabitGroupHeader /> component called without a value',
    );
  },
};

export default HabitGroupHeader;
