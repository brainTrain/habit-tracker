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

export function getHabitData(doc) {
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

  return newHabit;
}

export function habitsToEntities(habitsResponse) {
  let newHabits = [];

  habitsResponse.forEach((doc) => {
    const newHabit = getHabitData(doc);

    newHabits.push(newHabit);
  });

  const habitEntities = groupBy(newHabits, 'habitID');

  return habitEntities;
}

export function formatHabitGroups(params) {
  const { habitEntities, habitOptionsEntities } = params;
  const formattedHabits = {};

  Object.keys(habitEntities).forEach((newHabitID) => {
    const { habitLabel, habitID } = habitEntities[newHabitID][0] || {
      habitLabel: '',
      habitID: '',
    };
    // TODO: these are read only when we get them from redux-toolkit, figure out right way to sort in redux toolkit
    // guessing prolly in a reducer
    const groupedNewHabitsList = [...habitEntities[newHabitID]]?.sort(
      (a, b) => {
        return b?.datetime - a?.datetime;
      },
    );
    const groupedByDate = {};
    const dateOrder = [];
    // date grouping
    // TODO: do in selector
    groupedNewHabitsList.forEach((newHabit) => {
      const { datetime, count } = newHabit;
      const { negativeTimeOffset } = habitOptionsEntities[habitID] || {
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

export function habitOptionsToEntities(habitOptionsResponse) {
  let newHabitOptions = [];

  habitOptionsResponse.forEach((doc) => {
    const { habitID, habitOptionsID, negativeTimeOffset } = doc.data();
    const parsedTimeOffset = Number(negativeTimeOffset);
    const newHabitOption = {
      negativeTimeOffset: parsedTimeOffset,
      habitID,
      habitOptionsID,
      id: doc.id,
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
