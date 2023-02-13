// libraries
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// utils
import { fetchHabits, fetchHabitOptions } from './firebase/firestore';
import { formatHabitGroups, formatHabitOptions } from './parsers/habit';
import { appGutterPadding } from './styles/layout';
// components
import HabitGroup from './HabitGroup';
import HabitForm from './HabitForm';
// constants
const HABITS_LOADING = 'habits-loading';
const HABITS_LOADED = 'habits-loaded';
const HABITS_LOADED_ERROR = 'habits-loaded-error';
// styles
const HabitWrapper = styled.article`
  border: 1px solid;
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-radius: 0.2rem;
`;

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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

// -= fetch flow =-
// * fetch options
// * then fetch habits
// * then formmat habits based on options
// * if options are updated/added re-format habits
// * if habits are updated/added re-fetch habits

function HabitsPage({ userID, userEmail, onLogout }) {
  const [habitsGroups, setHabitsGroups] = useState({});
  const [habitOptions, setHabitOptions] = useState({});
  const [habitsLoadState, setHabitsLoadState] = useState(HABITS_LOADING);
  const [isCreateFormShown, setIsCreateFormShown] = useState(false);

  const handleHabitFetches = useCallback(() => {
    handleFetchHabitOptions();
  }, []);

  // TODO: probably need a fetch/fetches/api layer for these promises
  // cause we'll want to fetch options first, then fetch habits
  // this might also be a good time to move this parsing logic into
  // a parsing layer
  const handleFetchHabitOptions = useCallback(() => {
    fetchHabitOptions(userID).then((habitOptionsResponse) => {
      const formattedHabitOptions = formatHabitOptions({
        habitOptionsResponse,
      });

      setHabitOptions(formattedHabitOptions);
      // TODO: flatten this baby xmas tree
      handleFetchHabits(formattedHabitOptions);
    });
  }, []);

  const handleFetchHabits = useCallback(
    (formattedHabitOptions) => {
      fetchHabits(userID)
        .then((habitsResponse) => {
          const formattedHabits = formatHabitGroups({
            habitsResponse,
            habitOptions: formattedHabitOptions,
          });

          setHabitsGroups(formattedHabits);
          setHabitsLoadState(HABITS_LOADED);
        })
        .catch((error) => {
          console.error('error fetching habits', error);
          setHabitsLoadState(HABITS_LOADED_ERROR);
        });
    },
    [userID],
  );

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
      </AppHeader>
      <ContentWrapper>
        {{
          [HABITS_LOADING]: <p>loading...</p>,
          [HABITS_LOADED_ERROR]: <p>Error loading habits.</p>,
          [HABITS_LOADED]: (
            <section>
              {Object.keys(habitsGroups).map((key) => {
                const { habitID, habitLabel, dateOrder, data } =
                  habitsGroups[key];
                return (
                  <HabitWrapper key={key}>
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
                  </HabitWrapper>
                );
              })}
            </section>
          ),
        }[habitsLoadState] || <p>Error loading habits.</p>}
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
