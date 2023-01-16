import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import app from './';

export const db = getFirestore(app);

const HABIT = 'habit';

export function saveHabit(habitLabel, count, userID) {
  return addDoc(collection(db, HABIT), {
    userID,
    habitLabel,
    count,
    datetime: Timestamp.now(),
    publicID: nanoid(),
  });
}

export function fetchHabits(userID) {
  const habitRef = collection(db, HABIT);

  const q = query(habitRef, where('userID', '==', userID));

  return getDocs(q);
}
