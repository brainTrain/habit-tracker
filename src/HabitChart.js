// libraries
import { useCallback, useState, useEffect, useRef } from 'react';
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
  position: relative;
  padding-bottom: 1rem;

  @media ${mediaQueryDevice.laptop} {
    width: 100%;
  }
`;

const ResetZoomButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;
const ResetZoomButton = styled.button`
  margin: 0 auto;
`;

function HabitChart({ habitID, dateString }) {
  // redux props
  const chartData = useSelector((state) =>
    selectHabitChartDataByID(state, { habitID, dateString }),
  );
  // local state
  const [zoomDomain, setZoomDomain] = useState(null);
  const prevDateStringRef = useRef(dateString);

  useEffect(() => {
    const prevDateString = prevDateStringRef.current;

    if (prevDateString !== dateString) {
      // reset zoom when a user changes date because we have new chart data
      setZoomDomain(null);
      prevDateStringRef.current = dateString;
    }
  }, [dateString]);

  const handleZoom = useCallback((domain, props) => {
    // we need this handler for victory charts to honor the local zoomDomain state value
    setZoomDomain(domain);
  }, []);

  const handleResetZoomClick = useCallback(() => {
    setZoomDomain(null);
  }, []);

  return (
    <ChartWrapper>
      <VictoryChart
        domainPadding={20}
        containerComponent={
          <VictoryZoomContainer
            onZoomDomainChange={handleZoom}
            zoomDomain={zoomDomain}
          />
        }>
        <VictoryBar
          labelComponent={<VictoryTooltip />}
          data={chartData}
          x="datetime"
          y="count"
          style={{
            data: {
              fill: '#520F9A',
            },
          }}
        />
      </VictoryChart>
      <ResetZoomButtonWrapper>
        <ResetZoomButton onClick={handleResetZoomClick}>
          Reset Zoom
        </ResetZoomButton>
      </ResetZoomButtonWrapper>
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
