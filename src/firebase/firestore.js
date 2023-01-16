import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import app from './';

export const db = getFirestore(app);

const HABIT = 'habit';

export function saveHabit(habitLabel, count, userID) {
  return addDoc(collection(db, HABIT), {
    userID,
    habitLabel,
    count,
    datetime: Timestamp.now(),
  });
}

export function fetchHabits(userID) {
  const habitRef = collection(db, HABIT);

  const q = query(habitRef, where('userID', '==', userID));

  return getDocs(q);
}
