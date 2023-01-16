// libraries
import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// utils
import { deleteHabit } from './firebase/firestore';
// components
const TABLE_COLUMNS = ['Count', 'Time', 'Date'];
// styles
const TableWrapper = styled.section`
  width: 100%;
`;
const Table = styled.table`
  width: 100%;
`;

function HabitGroup({ habitLabel, habitsList, totalCount, onDeleteHabit }) {
  const [areDetailsShown, setAreDetailsShown] = useState(false);
  const handleToggleDetails = useCallback(() => {
    setAreDetailsShown((prev) => {
      return !prev;
    });
  }, []);

  const toggleDetailsText = areDetailsShown ? 'hide details' : 'show details';

  const handleDeleteLabel = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete this entire ${habitLabel} habit?`,
      )
    ) {
      deleteHabit(habitsList)
        .then(() => {
          onDeleteHabit(habitsList);
        })
        .catch((error) => {
          console.error('error deleting habit', error);
        });
    }
  }, [habitLabel, habitsList, onDeleteHabit]);

  return (
    <section>
      <h3>{habitLabel}</h3>
      <button onClick={handleDeleteLabel}>delete habit</button>
      <p>total: {totalCount}</p>
      <button onClick={handleToggleDetails}>{toggleDetailsText}</button>
      {areDetailsShown ? (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                {TABLE_COLUMNS.map((columnName) => {
                  return <th key={columnName}>{columnName}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {habitsList.map((habit) => {
                const { id, count, datetime } = habit;
                return (
                  <tr key={id}>
                    <td>{count}</td>
                    <td>{datetime.toLocaleTimeString()}</td>
                    <td>{datetime.toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
      ) : null}
    </section>
  );
}

HabitGroup.propTypes = {
  habitLabel: PropTypes.string,
  habitsList: PropTypes.array,
  onDeleteHabit: PropTypes.func,
  totalCount: PropTypes.number,
};

HabitGroup.defaultProps = {
  habitLabel: '',
  habitsList: [],
  onDeleteHabit: function () {
    console.warn(
      'onDeleteHabit() prop in <HabitGroup /> component called without a value',
    );
  },
  totalCount: 0,
};

export default HabitGroup;
