// libraries
import groupBy from 'lodash/groupBy';
import { subMinutes } from 'date-fns';
// utils
import { HABIT_OPTION_EMPTY } from '../firebase/models';

export function flattenHabitItems(groupedData) {
  const flatHabitItems = Object.keys(groupedData).reduce((prev, habitDate) => {
    const habitItems = groupedData[habitDate]?.tableList || [];
    return [...prev, ...habitItems];
  }, []);

  return flatHabitItems;
}

export function formatHabitGroups(params) {
  const { habitsResponse, habitOptions } = params;
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

    const groupedNewHabitsList = groupedNewHabits[newHabitID]?.sort((a, b) => {
      return b?.datetime - a?.datetime;
    });
    const groupedByDate = {};
    const dateOrder = [];
    // date grouping
    groupedNewHabitsList.forEach((newHabit) => {
      const { datetime, count } = newHabit;
      const { negativeTimeOffset } = habitOptions[habitID] || {
        ...HABIT_OPTION_EMPTY,
      };
      const newHabitTimeString = datetime.toLocaleTimeString();
      const updatedDate = subMinutes(datetime, negativeTimeOffset);
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

  return formattedHabits;
}

export function formatHabitOptions(params) {
  const { habitOptionsResponse } = params;
  let newHabitOptions = [];

  habitOptionsResponse.forEach((doc) => {
    // const { habitID, habitOptionsID, negativeTimeOffset } = doc.data();
    const { habitID, habitOptionsID, negativeTimeOffset } = doc;
    const parsedTimeOffset = Number(negativeTimeOffset);
    const newHabitOption = {
      negativeTimeOffset: parsedTimeOffset,
      habitID,
      habitOptionsID,
      id: doc.id || 'TODO',
    };
    newHabitOptions.push(newHabitOption);
  });

  const groupedNewHabitOptions = groupBy(newHabitOptions, 'habitID');
  const reducedNewHabitOptions = {};

  Object.keys(groupedNewHabitOptions).forEach((habitID) => {
    reducedNewHabitOptions[habitID] = groupedNewHabitOptions[habitID][0] || {
      ...HABIT_OPTION_EMPTY,
    };
  });

  return reducedNewHabitOptions;
}
