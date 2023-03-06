import { DateObject } from 'react-multi-date-picker';

export function minutesToHours(minutes) {
  return minutes / 60;
}

export function hoursToMinutes(hours) {
  return hours * 60;
}

export function dateStringToObject(string) {
  const splitString = string.split('/');
  const year = Number(splitString[2]);
  const month = Number(splitString[0]);
  const day = Number(splitString[1]);

  return new DateObject({
    year,
    month,
    day,
  });
}
