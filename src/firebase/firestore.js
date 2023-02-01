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

export function saveHabit(habitLabel, count, userID, date) {
  const datetime = date ? Timestamp.fromDate(date) : Timestamp.now();

  const data = {
    userID,
    habitLabel,
    count,
    datetime,
    publicID: nanoid(),
  };

  return addDoc(collection(db, HABIT_COLLECTION), data);
}

export function fetchHabits(userID) {
  const habitRef = collection(db, HABIT_COLLECTION);
  const q = query(habitRef, where('userID', '==', userID));

  return getDocs(q);
}

export function deleteHabit(habitsList) {
  const batch = writeBatch(db);

  habitsList.forEach(({ id }) => {
    batch.delete(doc(db, HABIT_COLLECTION, id));
  });

  return batch.commit();
}
