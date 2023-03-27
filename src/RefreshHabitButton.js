// libraries
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// utils
import { fetchHabitGroup } from './firebase/firestore';
import { getHabitData } from './parsers/habit';
// redux
import { selectHabitEntityByID } from './redux/habits';
// styles
const RefreshButton = styled.button`
  font-size: 1rem;
  height: 2rem;
  width: 2rem;
`;

function RefreshHabitButton({ habitID, userID }) {
  const dispatch = useDispatch();

  const handleRefresh = useCallback(async () => {
    try {
      const habitGroupResponse = await fetchHabitGroup(habitID, userID);
      console.log('habitGroupResponse', habitGroupResponse);

      habitGroupResponse.forEach((doc) => {
        const habitDoc = getHabitData(doc.id, doc.data());
        console.log('habitDoc', habitDoc);
      });
    } catch (error) {
      console.error(`error fetching habit group for ${habitID}`, error);
    }
  }, [habitID]);

  return <RefreshButton onClick={handleRefresh}>🔄</RefreshButton>;
}

RefreshHabitButton.propTypes = {
  habitID: PropTypes.string,
};

RefreshHabitButton.defaultProps = {
  habitID: '',
};

export default RefreshHabitButton;
