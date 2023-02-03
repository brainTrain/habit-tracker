// libraries
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import groupBy from 'lodash/groupBy';
import { subMinutes } from 'date-fns';
// utils
import { fetchHabits } from './firebase/firestore';
import { appGutterPadding } from './styles/layout';
// components
import HabitGroup from './HabitGroup';
import HabitsForm from './HabitsForm';
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

function HabitsPage({ userID, userEmail, onLogout }) {
  const [habitsGroups, setHabitsGroups] = useState({});
  const [habitsLoadState, setHabitsLoadState] = useState(HABITS_LOADING);
  const [isCreateFormShown, setIsCreateFormShown] = useState(false);

  const handleFetchHabits = useCallback(() => {
    fetchHabits(userID)
      .then((habitsResponse) => {
        let newHabits = [];

        habitsResponse.forEach((doc) => {
          const { count, datetime, habitLabel, publicID, habitID } = doc.data();
          const parsedCount = Number(count);
          const newHabit = {
            count: parsedCount,
            datetime: datetime.toDate(),
            habitLabel,
            habitID,
            publicID,
            id: doc.id,
          };
          newHabits.push(newHabit);
        });

        const groupedNewHabits = groupBy(newHabits, 'habitID');
        const formattedHabits = {};

        Object.keys(groupedNewHabits).forEach((newHabitID) => {
          const { habitLabel, habitID } = groupedNewHabits[newHabitID][0] || {
            habitLabel: '',
            habitID: '',
          };

          const groupedNewHabitsList = groupedNewHabits[newHabitID]?.sort(
            (a, b) => {
              return b?.datetime - a?.datetime;
            },
          );
          const groupedByDate = {};
          const dateOrder = [];
          // date grouping
          groupedNewHabitsList.forEach((newHabit) => {
            const { datetime, count } = newHabit;
            const newHabitTimeString = datetime.toLocaleTimeString();
            // for now add a 4 hour shift that's hard coded
            const updatedDate = subMinutes(datetime, 240);
            const updatedDateLocale = updatedDate.toLocaleDateString();

            const tableHabit = {
              ...newHabit,
            };
            const chartHabit = {
              ...{
                count,
                datetime,
                label: `${count} at ${newHabitTimeString}`,
              },
            };

            if (!groupedByDate[updatedDateLocale]) {
              dateOrder.push(updatedDateLocale);
              groupedByDate[updatedDateLocale] = {
                totalCount: 0,
                tableList: [tableHabit],
                chartList: [chartHabit],
              };
            } else {
              groupedByDate[updatedDateLocale].tableList.push(tableHabit);
              groupedByDate[updatedDateLocale].chartList.push(chartHabit);
            }
          });
          // get total counts for each date and update the totalCount value for each
          Object.keys(groupedByDate).forEach((dateString) => {
            const data = groupedByDate[dateString].tableList;
            const totalCount = data.reduce((previousCount, { count }) => {
              return previousCount + count;
            }, 0);
            groupedByDate[dateString].totalCount = totalCount;
          });

          // get total for date group?
          formattedHabits[newHabitID] = {
            habitLabel,
            habitID,
            data: groupedByDate,
            dateOrder,
          };
        });

        setHabitsGroups(formattedHabits);

        setHabitsLoadState(HABITS_LOADED);
      })
      .catch((error) => {
        console.error('error fetching habits', error);
        setHabitsLoadState(HABITS_LOADED_ERROR);
      });
  }, [userID]);

  // TODO: make this header section its own component and raise it up a level broooooo
  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);
  // TODO: try to just pass handleFetchHabits to the delete function prop
  const handleDeleteHabit = useCallback(() => {
    handleFetchHabits();
  }, [handleFetchHabits]);

  const handleToggleCreateFormClick = useCallback(() => {
    setIsCreateFormShown((prev) => !prev);
  }, []);

  useEffect(() => {
    handleFetchHabits();
  }, [handleFetchHabits]);

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
              <HabitsForm userID={userID} onAddHabit={handleFetchHabits} />
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
                      onAddHabit={handleFetchHabits}
                      onDeleteHabit={handleDeleteHabit}
                      userID={userID}
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
