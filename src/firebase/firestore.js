import {
  Timestamp,
  addDoc,
  // TODO: bring back (or not?)
  // updateDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import app from './';

export const db = getFirestore(app);

const HABIT_COLLECTION = 'habit';
// TODO: bring back when we hook up habit options for realz
// const HABIT_OPTIONS_COLLECTION = 'habit-options';

// Habit methods
export function saveHabit(habitLabel, count, userID, date, habitID) {
  const datetime = date ? Timestamp.fromDate(date) : Timestamp.now();
  const hasHabitID = Boolean(habitID);

  const data = {
    userID,
    habitLabel,
    count,
    datetime,
    publicID: nanoid(),
    habitID: hasHabitID ? habitID : nanoid(),
  };

  return addDoc(collection(db, HABIT_COLLECTION), data);
}

export async function fetchHabits(userID) {
  const habitRef = collection(db, HABIT_COLLECTION);
  const q = query(habitRef, where('userID', '==', userID));

  return getDocs(q);
}

export function updateHabit(habitItems, key, value) {
  const batch = writeBatch(db);
  habitItems.forEach(({ id }) => {
    batch.update(doc(db, HABIT_COLLECTION, id), { [key]: value });
  });

  return batch.commit();
}

/*
example usage of above api
const handleUpdate = () => {
  const flatHabit = flattenHabitItems(groupedData);
  const ID = nanoid();

  updateHabit(flatHabit, 'habitID', ID)
    .then(() => {
      onDeleteHabit();
      setIsMenuOpen(false);
    })
    .catch((error) => {
      console.error('error deleting habit', error);
    });
};
*/

export function deleteHabit(habitItems) {
  const batch = writeBatch(db);

  habitItems.forEach(({ id }) => {
    batch.delete(doc(db, HABIT_COLLECTION, id));
  });

  return batch.commit();
}

// Habit Option methods
export function saveHabitOptions(params) {
  const { habitID, userID, habitOptions, habitOptionsID } = params;
  const hasHabitOptionsID = Boolean(habitOptionsID);
  const data = {
    userID,
    habitID,
    ...habitOptions,
  };

  if (hasHabitOptionsID) {
    updateHabitOptions(data);
  } else {
    data.habitOptionsID = nanoid();
    addHabitOptions(data);
  }

  return new Promise((resolve, reject) => {
    reject({ message: 'nope' });
  });
}

/*
  habits by user
  {
    [habitID]: {
      userID,
      habitLabel,
      count,
      datetime,
      publicID,
      habitID,
    }
  }

  habit options by user 
  // iterate over array, make object with habitID as key
  // 1:1 habitOptionsID to habitID
  {
    [habitID]: {
      userID,
      habitID,
      habitOptionsID,
      negativeTimeOffset,
    }
  }

*/

function addHabitOptions(data) {
  console.log('create', data);
  // return addDoc(collection(db, HABIT_OPTIONS_COLLECTION), data);
}

function updateHabitOptions(data) {
  console.log('update', data);
  // const washingtonRef = doc(db, 'cities', 'DC');
  // Set the "capital" field of the city 'DC'
  /*
  updateDoc(washingtonRef, {
    capital: true,
  });
  */
}
/*
export async function fetchHabitOptions(userID) {
  const habitRef = collection(db, HABIT_OPTIONS_COLLECTION);
  const q = query(habitRef, where('userID', '==', userID));

  return getDocs(q);
}
*/

// FAKE DATA
const FAKE_HABIT_OPTION_1 = {
  habitID: '01NO9xdlKLTm00zaP2uG_',
  negativeTimeOffset: 240,
  habitOptionsID: 'fasdfasdfsdf',
};
const FAKE_HABIT_OPTION_2 = {
  habitID: 'lWAdZdHp8TCARciRnd8tO',
  negativeTimeOffset: 240,
  habitOptionsID: 'uhhhhhhhhhhh',
};
const FAKE_HABIT_OPTIONS = [FAKE_HABIT_OPTION_1, FAKE_HABIT_OPTION_2];

export async function fetchHabitOptions(userID) {
  const fakeFetch = new Promise((resolve) => {
    setTimeout(() => {
      resolve([...FAKE_HABIT_OPTIONS]);
    }, 500);
  });

  return fakeFetch;
}
