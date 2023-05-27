// libraries
import groupBy from 'lodash/groupBy';
import { subMinutes, intervalToDuration, max } from 'date-fns';
// utils
import { HABIT_OPTION_EMPTY } from '../firebase/models';
// constants
export const TIME_INTERVAL_EMPTY = {
  hours: '00',
  seconds: '00',
  minutes: '00',
};

export function flattenHabitItems(groupedData) {
  const flatHabitItems = Object.keys(groupedData).reduce((prev, habitDate) => {
    const habitItems = groupedData[habitDate]?.tableList || [];
    return [...prev, ...habitItems];
  }, []);

  return flatHabitItems;
}

export function getHabitData(id, doc) {
  const { count, datetime, habitLabel, publicID, habitID } = doc;
  const parsedCount = Number(count);
  const newHabit = {
    count: parsedCount,
    // .toDate() is a firestore datetime object method that converts to js date object
    datetime: datetime.toDate().toString(),
    habitLabel,
    habitID,
    publicID,
    id,
  };

  return newHabit;
}

export function habitsEntityDocumentsToHabits(habitDocuments) {
  const habitEntities = groupBy(habitDocuments, 'habitID');
  const normalizedHabitEntitiesList = [];
  const documentIDList = [];
  const datetimeList = [];
  const { habitLabel, habitID } = habitDocuments[0] || {
    habitLabel: '',
    habitID: '',
  };

  habitEntities[habitID].forEach(({ id, datetime }) => {
    documentIDList.push(id);
    datetimeList.push(new Date(datetime));
  });

  const latestDate = max(datetimeList)?.toString();

  Object.keys(habitEntities).forEach((habitID) => {
    normalizedHabitEntitiesList.push({
      id: habitID,
      habitLabel,
      habitID,
      latestDate,
      documentIDList,
    });
  });

  return normalizedHabitEntitiesList;
}

export function sortHabitsByDate(habitsList, habitDocumentEntities) {
  const sortedHabitsList = habitsList?.sort((a, b) => {
    const dateA = new Date(habitDocumentEntities[b]?.datetime);
    const dateB = new Date(habitDocumentEntities[a]?.datetime);

    return dateA - dateB;
  });

  return sortedHabitsList;
}

export function formatHabitGroups(params) {
  const { habitEntities, habitDocumentEntities, habitOptionsEntities } = params;
  const formattedHabits = {};

  Object.keys(habitEntities).forEach((newHabitID) => {
    // TODO: There's gotta be a better way to do this entities lookup
    const { habitLabel, habitID } = habitDocumentEntities[
      habitEntities[newHabitID].documentIDList[0]
    ] || {
      habitLabel: '',
      habitID: '',
    };
    // TODO: these are read only when we get them from redux-toolkit, figure out right way to sort in redux toolkit
    // guessing prolly in a reducer
    const sortedHabitsList = sortHabitsByDate(
      [...habitEntities[newHabitID].documentIDList],
      habitDocumentEntities,
    );
    const groupedByDate = {};
    const dateOrder = [];
    // date grouping
    // TODO: do in selector
    sortedHabitsList.forEach((newHabit) => {
      const { datetime, count } = habitDocumentEntities[newHabit];
      const datetimeObj = new Date(datetime);
      const { negativeTimeOffset } = habitOptionsEntities[habitID] || {
        ...HABIT_OPTION_EMPTY,
      };
      const newHabitTimeString = datetimeObj.toLocaleTimeString();
      const updatedDate = subMinutes(datetimeObj, negativeTimeOffset);
      const updatedDateLocale = updatedDate.toLocaleDateString();

      const tableHabit = {
        ...habitDocumentEntities[newHabit],
        datetime: datetimeObj,
      };
      const chartHabit = {
        ...{
          count,
          datetime: datetimeObj,
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
    // also get time delta
    Object.keys(groupedByDate).forEach((dateString) => {
      const data = groupedByDate[dateString].tableList;
      const totalCount = data.reduce((previousCount, { count }) => {
        return previousCount + count;
      }, 0);
      groupedByDate[dateString].totalCount = totalCount;

      let timeInterval = { ...TIME_INTERVAL_EMPTY };
      if (data.length > 1) {
        // assume dates are sorted most recent to least recent
        const latestDate = data[0].datetime;
        const earliestDate = data[data.length - 1].datetime;
        timeInterval = intervalToDuration({
          start: earliestDate,
          end: latestDate,
        });
      }
      const hours = String(timeInterval.hours);
      const minutes = String(timeInterval.minutes);
      const seconds = String(timeInterval.seconds);

      groupedByDate[dateString].timeInterval = {
        hours: hours.length === 1 ? `0${hours}` : hours,
        minutes: minutes.length === 1 ? `0${minutes}` : minutes,
        seconds: seconds.length === 1 ? `0${seconds}` : seconds,
      };
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

export function getHabitOptionsData(id, doc) {
  const { habitID, habitOptionsID, negativeTimeOffset } = doc;
  const parsedTimeOffset = Number(negativeTimeOffset);
  const newHabitOptions = {
    negativeTimeOffset: parsedTimeOffset,
    habitID,
    habitOptionsID,
    id,
  };

  return newHabitOptions;
}

export function habitOptionsToList(habitOptionsResponse) {
  let newHabitOptionsList = [];

  habitOptionsResponse.forEach((doc) => {
    const newHabitOptions = getHabitOptionsData(doc.id, doc.data());

    newHabitOptionsList.push(newHabitOptions);
  });

  return newHabitOptionsList;
}
