import {
  Timestamp,
  addDoc,
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

export function fetchHabits(userID) {
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
