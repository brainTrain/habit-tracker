// libraries
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { format } from 'date-fns';
// redux
import { selectHabitTableDataByID } from './redux/habits';
// utils
import { mediaQueryDevice } from './styles/constants';
// reusable styles
import { MenuButton } from './styles/components';
// constants
const TABLE_COLUMNS = ['Count', 'Time', 'Date'];
// styles
const TableWrapper = styled.section`
  width: 100%;
  max-height: 20rem;
  overflow: auto;
  border: 1px solid;
`;

const Table = styled.table`
  width: 100%;
  height: 100%;
  text-align: left;
  border-collapse: collapse;
`;

const Th = styled.th`
  border: 1px solid;
  border-top: none;
  padding: 0.5rem;

  &:first-of-type {
    border-left: none;
  }

  &:last-of-type {
    border-right: none;
  }

  @media ${mediaQueryDevice.mobileXL} {
    padding: 1rem;
  }
`;

const Tr = styled.tr`
  &:last-of-type {
    td {
      border-bottom: none;
    }
  }

  td {
    &:first-of-type {
      border-left: none;
    }

    &:last-of-type {
      border-right: none;
    }
  }
`;

const Td = styled.td`
  border: 1px solid;
  padding: 0.5rem;

  @media ${mediaQueryDevice.mobileXL} {
    padding: 1rem;
  }
`;

const TableCount = styled.p``;
const TableDate = styled.p``;
const TableYear = styled.p``;
const TableTime = styled.p``;
const TableAMPM = styled.p``;

const DeleteRecordButton = styled(MenuButton)`
  margin: 0 auto;
`;

function HabitTable({ habitID, dateString, onDeleteHabitRecord }) {
  // redux props
  const tableData = useSelector((state) =>
    selectHabitTableDataByID(state, { habitID, dateString }),
  );

  return (
    <TableWrapper>
      <Table border={1}>
        <thead>
          <tr>
            {TABLE_COLUMNS.map((columnName) => {
              return <Th key={columnName}>{columnName}</Th>;
            })}
            <Th>Delete</Th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((habit) => {
            const { id, count, datetime } = habit;

            const timeString = format(datetime, 'h:mm');
            const timeAMPMString = format(datetime, 'a');
            const dateString = datetime.toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });
            const yearString = datetime.toLocaleDateString([], {
              year: 'numeric',
            });

            return (
              <Tr key={id}>
                <Td>
                  <TableCount>{count}</TableCount>
                </Td>
                {/* empty array instead of locale string in first param defaults to default local */}
                <Td>
                  <TableTime>{timeString}</TableTime>
                  <TableAMPM>{timeAMPMString}</TableAMPM>
                </Td>
                <Td>
                  <TableDate>{dateString}</TableDate>
                  <TableYear>{yearString}</TableYear>
                </Td>
                <Td>
                  <DeleteRecordButton
                    onClick={() => onDeleteHabitRecord(habit)}>
                    x
                  </DeleteRecordButton>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </TableWrapper>
  );
}

HabitTable.propTypes = {
  habitID: PropTypes.string,
  dateString: PropTypes.string,
  onDeleteHabitRecord: PropTypes.func,
};

HabitTable.defaultProps = {
  habitID: '',
  dateString: '',
  onDeleteHabitRecord: function () {
    console.warn(
      'onDeleteHabitRecord() prop in <HabitTable /> component called without a value',
    );
  },
};

export default HabitTable;
