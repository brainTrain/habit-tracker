// libraries
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import difference from 'lodash/difference';
// utils
import {
  appGutterPadding,
  MAX_PAGE_WIDTH,
  TOP_BOTTOM_PAGE_GUTTER,
} from './styles/layout';
import { mediaQueryDevice } from './styles/constants';
import {
  ADD_DOCUMENT_CREATE_HABIT,
  ADD_DOCUMENT_UPDATE_HABIT,
  DELETE_HABIT_BY_DAY,
  DELETE_ENTIRE_HABIT,
  DELETE_HABIT_DOCUMENT,
  CREATE_HABIT_OPTIONS,
  UPDATE_HABIT_OPTIONS,
  deleteHabitOptions,
} from './firebase/firestore';
import { getHabitData, getHabitOptionsData } from './parsers/habit';
// redux
import {
  fetchHabitDocuments,
  habitDocumentsAddOne,
  habitDocumentsRemoveMany,
} from './redux/habit-documents';
import {
  createHabits,
  selectHabitIDs,
  habitAddOne,
  habitUpdateOne,
  habitRemoveOne,
} from './redux/habits';
import {
  habitOptionsAddOne,
  habitOptionsUpdateOne,
  habitOptionsRemoveOne,
} from './redux/habit-options';
import { fetchHabitOptionsRedux } from './redux/habit-options';
// components
import HabitsPageHeader from './HabitsPageHeader';
import HabitGroup from './HabitGroup';
// constants
const HABITS_LOADING = 'habits-loading';
const HABITS_LOADED = 'habits-loaded';
const HABITS_LOADED_ERROR = 'habits-loaded-error';
// styles
const PageWrapper = styled.section`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.section`
  ${appGutterPadding};

  width: 100%;
  padding-top: ${TOP_BOTTOM_PAGE_GUTTER};
  height: 100%;
  overflow: auto;
`;

const Content = styled.section`
  height: 100%;
  width: 100%;
  margin: 0 auto;
  max-width: ${MAX_PAGE_WIDTH};
`;

const HabitWrapper = styled.section`
  width: 100%;
  display: grid;
  grid-gap: 0.5rem;
  grid-template-columns: minmax(0, 1fr);
  padding-bottom: ${TOP_BOTTOM_PAGE_GUTTER};

  @media ${mediaQueryDevice.laptop} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

const HabitCell = styled.article`
  padding: 1rem 0;
  border: 1px solid;
  border-radius: 0.2rem;
`;

function HabitsPage({ userID, userEmail, onLogout }) {
  const [habitsLoadState, setHabitsLoadState] = useState(HABITS_LOADING);
  const habitIDs = useSelector(selectHabitIDs);
  const dispatch = useDispatch();

  const handleFetchHabitData = useCallback(async () => {
    try {
      await dispatch(fetchHabitOptionsRedux(userID));
      const habitDocumentsRes = await dispatch(fetchHabitDocuments(userID));
      // create habit groups based on fetched habit documents
      await dispatch(createHabits(habitDocumentsRes.payload));

      setHabitsLoadState(HABITS_LOADED);
    } catch (error) {
      console.error('error fetching habits and options', error);
      setHabitsLoadState(HABITS_LOADED_ERROR);
    }
  }, [userID, dispatch]);

  const handleAddHabit = useCallback(
    (response) => {
      const { operation, habitDocument, oldHabit } = response;
      const newHabitDocument = getHabitData(habitDocument.id, habitDocument);
      const { habitID } = newHabitDocument;
      const newHabit = {
        id: habitID,
        documentIDList: [newHabitDocument.id],
      };
      if (operation === ADD_DOCUMENT_CREATE_HABIT) {
        dispatch(habitDocumentsAddOne(newHabitDocument));
        dispatch(habitAddOne(newHabit));
      }
      if (operation === ADD_DOCUMENT_UPDATE_HABIT) {
        const newHabitUpdate = {
          id: habitID,
          changes: {
            documentIDList: [newHabitDocument.id, ...oldHabit.documentIDList],
          },
        };

        dispatch(habitDocumentsAddOne(newHabitDocument));
        dispatch(habitUpdateOne(newHabitUpdate));
      }
    },
    [dispatch],
  );

  const handleAddHabitOption = useCallback(
    (response) => {
      const { operation, habitOptionsDocument } = response;
      const newHabitOptionsDocument = getHabitOptionsData(
        habitOptionsDocument.id,
        habitOptionsDocument,
      );
      const { habitID } = newHabitOptionsDocument;

      if (operation === CREATE_HABIT_OPTIONS) {
        dispatch(habitOptionsAddOne(newHabitOptionsDocument));
      }
      if (operation === UPDATE_HABIT_OPTIONS) {
        const newHabitOptionsUpdate = {
          id: habitID,
          changes: {
            ...newHabitOptionsDocument,
          },
        };

        dispatch(habitOptionsUpdateOne(newHabitOptionsUpdate));
      }
    },
    [dispatch],
  );

  const handleDeleteHabit = useCallback(
    (response) => {
      const { operation, habitDocuments, oldHabit, habitOptions } = response;
      const { habitID } = habitDocuments[0];
      const habitDocumentIDs = habitDocuments.map(({ id }) => id);
      const newHabitDocumentIDs = difference(
        oldHabit.documentIDList,
        habitDocumentIDs,
      );
      // if removing these documents from a habit documentIDList results in an
      // empty array this habit no longer has any documents and should be removed
      // or if we are explicitly removing all of them
      const shouldDeleteHabit = Boolean(
        !newHabitDocumentIDs.length || operation === DELETE_ENTIRE_HABIT,
      );
      // always remove documents
      dispatch(habitDocumentsRemoveMany(habitDocumentIDs));

      if (operation === DELETE_HABIT_DOCUMENT || DELETE_HABIT_BY_DAY) {
        const newHabitUpdate = {
          id: habitID,
          changes: {
            documentIDList: newHabitDocumentIDs,
          },
        };

        dispatch(habitUpdateOne(newHabitUpdate));
      }

      if (shouldDeleteHabit) {
        dispatch(habitRemoveOne(habitID));
        // also delete habitOptions if they exist
        if (habitOptions) {
          deleteHabitOptions(habitOptions.id);
          dispatch(habitOptionsRemoveOne(habitID));
        }
      }
    },
    [dispatch],
  );

  useEffect(() => {
    handleFetchHabitData();
  }, [handleFetchHabitData]);

  return (
    <PageWrapper>
      <HabitsPageHeader
        userID={userID}
        userEmail={userEmail}
        onLogout={onLogout}
        onAddHabit={handleAddHabit}
      />
      <ContentWrapper>
        <Content>
          {{
            [HABITS_LOADING]: <p>loading...</p>,
            [HABITS_LOADED_ERROR]: <p>Error loading habits.</p>,
            [HABITS_LOADED]: (
              <HabitWrapper>
                {habitIDs.map((key) => {
                  return (
                    <HabitCell key={key}>
                      <HabitGroup
                        userID={userID}
                        habitID={key}
                        onAddHabit={handleAddHabit}
                        onDeleteHabit={handleDeleteHabit}
                        onAddHabitOption={handleAddHabitOption}
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
