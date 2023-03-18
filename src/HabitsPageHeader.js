// libraries
import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// utils
import { appGutterPadding, MAX_PAGE_WIDTH } from './styles/layout';
// components
import HabitForm from './HabitForm';
// styles
const AppHeader = styled.header`
  ${appGutterPadding};
  padding-top: 1rem;
  padding-bottom: 1rem;

  border-bottom: 1px solid;
`;

const AppHeaderContent = styled.header`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: ${MAX_PAGE_WIDTH};
`;

const AppHeaderTopSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const AppHeaderTitle = styled.h1`
  margin: 0;
`;

const HabitFormWrapper = styled.section`
  padding-top: 0.5rem;
`;

function HabitsPageHeader({ userID, userEmail, onLogout, onAddHabit }) {
  const [isCreateFormShown, setIsCreateFormShown] = useState(false);

  const handleToggleCreateFormClick = useCallback(() => {
    setIsCreateFormShown((prev) => !prev);
  }, []);

  return (
    <AppHeader>
      <AppHeaderContent>
        <AppHeaderTopSection>
          <span>
            <AppHeaderTitle>Habits for:</AppHeaderTitle>
            <span>{userEmail}</span>
          </span>
          <button onClick={onLogout}>logout</button>
        </AppHeaderTopSection>
        <section>
          <label>Create Habit Form: </label>
          <button onClick={handleToggleCreateFormClick}>
            {isCreateFormShown ? 'hide' : 'show'}
          </button>
          {isCreateFormShown ? (
            <HabitFormWrapper>
              <HabitForm userID={userID} onAddHabit={onAddHabit} />
            </HabitFormWrapper>
          ) : null}
        </section>
      </AppHeaderContent>
    </AppHeader>
  );
}

HabitsPageHeader.propTypes = {
  userID: PropTypes.string,
  userEmail: PropTypes.string,
  onLogout: PropTypes.func,
  onAddHabit: PropTypes.func,
};

HabitsPageHeader.defaultProps = {
  userID: '',
  userEmail: '',
  onLogout: function () {
    console.warn(
      'onLogout() prop in <HabitsPageHeader /> component called without a value',
    );
  },
  onAddHabit: function () {
    console.warn(
      'onAddHabit() prop in <HabitsPageHeader /> component called without a value',
    );
  },
};

export default HabitsPageHeader;
