// libraries
import PropTypes from 'prop-types';
import styled from 'styled-components';
// components
import HabitForm from './HabitForm';
// reusable styles
import {
  MenuHeader,
  MenuHeaderTop,
  HabitLabel,
  HabitCurrentDate,
  MenuButton,
} from './styles/components';
// styles
const FormWrapper = styled.section`
  margin-top: 1rem;
`;

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
      <section>
        <FormWrapper>
          <HabitForm
            userID={userID}
            habitID={habitID}
            habitLabel={habitLabel}
            onAddHabit={onAddHabit}
          />
        </FormWrapper>
      </section>
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
