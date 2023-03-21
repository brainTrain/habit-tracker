// libraries
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTheme } from '@nivo/core';
import { ResponsiveBar } from '@nivo/bar';
import { format } from 'date-fns';
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

const localeTimeFormat = (datetime) => {
  const timeString = format(datetime, 'h:mm');
  const timeAMPMString = format(datetime, 'a');

  return `${timeString} ${timeAMPMString}`;
};

function CustomToolTip({ value }) {
  const {
    data: { label },
  } = value;
  const theme = useTheme();

  return <div style={{ ...theme.tooltip.container }}>{label}</div>;
}

// return <div style={{ ...theme.tooltip.container }}>bruh</div>;

function HabitChart({ habitID, dateString }) {
  // redux props
  const chartData = useSelector((state) =>
    selectHabitChartDataByID(state, { habitID, dateString }),
  );

  return (
    <ChartWrapper>
      <ResponsiveBar
        data={chartData}
        keys={['count']}
        indexBy="datetime"
        tooltipFormat={(value) => 'bruh'}
        margin={{ top: 5, right: 5, bottom: 30, left: 30 }}
        padding={0.3}
        valueFormat={localeTimeFormat}
        xScale={{
          precision: 'second',
          format: '%Y-%m-%d %H:%M:%S.%L',
          type: 'time',
        }}
        yScale={{ type: 'linear' }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        axisBottom={{
          format: localeTimeFormat,
        }}
        axisTop={null}
        axisRight={null}
        colors={{ scheme: 'nivo' }}
        enableLabel={false}
        tooltip={(value) => <CustomToolTip value={value} />}
      />
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
