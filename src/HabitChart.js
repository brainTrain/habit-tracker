// libraries
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  VictoryBar,
  VictoryChart,
  VictoryTooltip,
  VictoryZoomContainer,
} from 'victory';
// redux
import { selectHabitChartDataByID } from './redux/habits';
// utils
import { mediaQueryDevice } from './styles/constants';
// styles
const ChartWrapper = styled.section`
  width: auto;
  height: 20rem;
  user-select: none;
  display: inline-block;
  border: 1px solid;

  @media ${mediaQueryDevice.laptop} {
    width: 100%;
  }
`;

function HabitChart({ habitID, dateString }) {
  // redux props
  const chartData = useSelector((state) =>
    selectHabitChartDataByID(state, { habitID, dateString }),
  );

  return (
    <ChartWrapper>
      <VictoryChart
        domainPadding={20}
        containerComponent={<VictoryZoomContainer />}>
        <VictoryBar
          labelComponent={<VictoryTooltip />}
          data={chartData}
          x="datetime"
          y="count"
        />
      </VictoryChart>
    </ChartWrapper>
  );
}

HabitChart.propTypes = {
  habitID: PropTypes.string,
  dateString: PropTypes.string,
};

HabitChart.defaultProps = {
  habitID: '',
  dateString: '',
};

export default HabitChart;
