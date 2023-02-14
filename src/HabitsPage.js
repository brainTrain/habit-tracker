// libraries
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// utils
import { fetchHabits, fetchHabitOptions } from './firebase/firestore';
import { formatHabitGroups, formatHabitOptions } from './parsers/habit';
import { appGutterPadding, MAX_PAGE_WIDTH, mediaQueryDevice } from './styles/layout';
// components
import HabitGroup from './HabitGroup';
import HabitForm from './HabitForm';
// constants
const HABITS_LOADING = 'habits-loading';
const HABITS_LOADED = 'habits-loaded';
const HABITS_LOADED_ERROR = 'habits-loaded-error';
// styles
const PageWrapper = styled.section`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

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

const ContentWrapper = styled.section`
  ${appGutterPadding};

  padding-top: 2rem;
  height: 100%;
  overflow: auto;
`;

const Content = styled.section`
  height: 100%;
  margin: 0 auto;
  max-width: ${MAX_PAGE_WIDTH};
`;

const HabitWrapper = styled.article`
  width: 100%;
  display: grid;
  grid-gap: 0.5rem;
  grid-template-columns: 1fr;

  @media ${mediaQueryDevice.laptop} { 
    grid-template-columns: 1fr 1fr;
  }
`;

const HabitCell = styled.article`
  padding: 1rem 0;
  border: 1px solid;
  border-radius: 0.2rem;
`;

function HabitsPage({ userID, userEmail, onLogout }) {
  const [habitsGroups, setHabitsGroups] = useState({});
  const [habitOptions, setHabitOptions] = useState({});
  const [habitsLoadState, setHabitsLoadState] = useState(HABITS_LOADING);
  const [isCreateFormShown, setIsCreateFormShown] = useState(false);

  const handleFetchHabitData = useCallback(async () => {
    try {
      const habitOptionsResponse = await fetchHabitOptions(userID);
      const formattedHabitOptions = formatHabitOptions({
        habitOptionsResponse,
      });

      const habitsResponse = await fetchHabits(userID);
      const formattedHabits = formatHabitGroups({
        habitsResponse,
        habitOptions: formattedHabitOptions,
      });

      setHabitOptions(formattedHabitOptions);
      setHabitsGroups(formattedHabits);
      setHabitsLoadState(HABITS_LOADED);
    } catch (error) {
      console.error('error fetching habits and options', error);
      setHabitsLoadState(HABITS_LOADED_ERROR);
    }
  }, [userID]);

  const handleHabitFetches = useCallback(() => {
    handleFetchHabitData();
  }, [handleFetchHabitData]);

  // TODO: make this header section its own component and raise it up a level broooooo
  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);
  // TODO: try to just pass handleHabitFetches to the delete function prop
  const handleDeleteHabit = useCallback(() => {
    handleHabitFetches();
  }, [handleHabitFetches]);

  const handleToggleCreateFormClick = useCallback(() => {
    setIsCreateFormShown((prev) => !prev);
  }, []);

  useEffect(() => {
    handleHabitFetches();
  }, [handleHabitFetches]);

  return (
    <PageWrapper>
      <AppHeader>
        <AppHeaderContent>
        <AppHeaderTopSection>
          <span>
            <AppHeaderTitle>Habits for:</AppHeaderTitle>
            <span>{userEmail}</span>
          </span>
          <button onClick={handleLogout}>logout</button>
        </AppHeaderTopSection>
        <section>
          <label>Create Habit Form: </label>
          <button onClick={handleToggleCreateFormClick}>
            {isCreateFormShown ? 'hide' : 'show'}
          </button>
          {isCreateFormShown ? (
            <HabitFormWrapper>
              <HabitForm userID={userID} onAddHabit={handleHabitFetches} />
            </HabitFormWrapper>
          ) : null}
        </section>
        </AppHeaderContent>
      </AppHeader>
      <ContentWrapper>
        <Content>
        {{
          [HABITS_LOADING]: <p>loading...</p>,
          [HABITS_LOADED_ERROR]: <p>Error loading habits.</p>,
          [HABITS_LOADED]: (
            <HabitWrapper>
              {Object.keys(habitsGroups).map((key) => {
                const { habitID, habitLabel, dateOrder, data } =
                  habitsGroups[key];
                return (
                  <HabitCell key={key}>
                    <HabitGroup
                      groupedData={data}
                      dateOrder={dateOrder}
                      habitLabel={habitLabel}
                      habitID={habitID}
                      onAddHabit={handleHabitFetches}
                      onDeleteHabit={handleDeleteHabit}
                      userID={userID}
                      habitOptions={habitOptions[habitID]}
                    />
                  </HabitCell>
                );
              })}
            </HabitWrapper>
          ),
        }[habitsLoadState] || <p>Error loading habits.</p>}
        </Content>
      </ContentWrapper>
    </PageWrapper>
  );
}

HabitsPage.propTypes = {
  userID: PropTypes.string,
  userEmail: PropTypes.string,
  onLogout: PropTypes.func,
};

HabitsPage.defaultProps = {
  userID: '',
  userEmail: '',
  onLogout: function () {
    console.warn(
      'onLogout() prop in <HabitsPage /> component called without a value',
    );
  },
};

export default HabitsPage;
