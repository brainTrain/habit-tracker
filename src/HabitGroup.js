// libraries
import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDetectClickOutside } from 'react-detect-click-outside';
// utils
import { deleteHabit } from './firebase/firestore';
// components
const TABLE_COLUMNS = ['Count', 'Time', 'Date'];
// styles
const MenuHeader = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuWrapper = styled.section`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MenuButton = styled.button`
  cursor: pointer;
  font-size: 1rem;
  height: 2rem;
  width: 2rem;
`;

const DeleteButton = styled.button`
  cursor: pointer;
  white-space: nowrap;
`;

const MenuContent = styled.section`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.2rem;
  position: absolute;
  top: 100%;
  right: 0;
`;

const TableWrapper = styled.section`
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
`;

function HabitGroup({ habitLabel, habitsList, totalCount, onDeleteHabit }) {
  const [areDetailsShown, setAreDetailsShown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleMenuButtonClick = useCallback(() => {
    setIsMenuOpen((prev) => {
      return !prev;
    });
  }, []);

  const menuWrapperRef = useDetectClickOutside({
    onTriggered: () => {
      setIsMenuOpen(false);
    },
  });

  const menuButtonContent = isMenuOpen ? '✕' : '⋯';

  return (
    <section>
      <MenuHeader>
        <h3>{habitLabel}</h3>
        <MenuWrapper ref={menuWrapperRef}>
          <MenuButton onClick={handleMenuButtonClick}>
            {menuButtonContent}
          </MenuButton>
          {isMenuOpen ? (
            <MenuContent>
              <DeleteButton onClick={handleDeleteLabel}>
                delete habit
              </DeleteButton>
            </MenuContent>
          ) : null}
        </MenuWrapper>
      </MenuHeader>
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
