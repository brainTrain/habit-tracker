import {
  Timestamp,
  addDoc,
  updateDoc,
  collection,
  getDoc,
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
// firestore collections
const HABIT_COLLECTION = 'habit';
const HABIT_OPTIONS_COLLECTION = 'habit-options';
// async CRUD operation enums
export const DELETE_HABIT_BY_DAY = 'delete-habit-by-day';
export const DELETE_ENTIRE_HABIT = 'delete-entire-habit';
export const DELETE_HABIT_DOCUMENT = 'delete-habit-document';
// adds new document for an existing habit
export const ADD_DOCUMENT_UPDATE_HABIT = 'add-document-update-habit';
// adds new document that creates habit
export const ADD_DOCUMENT_CREATE_HABIT = 'add-document-create-habit';

// Habit methods
export async function saveHabit(habitLabel, count, userID, date, habitID) {
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

  const docRef = await addDoc(collection(db, HABIT_COLLECTION), data);
  const docSnapshot = await getDoc(docRef);

  return {
    docRef,
    habitDocument: {
      ...docSnapshot.data(),
      id: docSnapshot.id,
    },
    operation: hasHabitID
      ? ADD_DOCUMENT_UPDATE_HABIT
      : ADD_DOCUMENT_CREATE_HABIT,
  };
}

export async function fetchHabits(userID) {
  const habitRef = collection(db, HABIT_COLLECTION);
  const q = query(habitRef, where('userID', '==', userID));

  return getDocs(q);
}

export async function updateHabit(habitItems, key, value) {
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

export async function deleteHabit(habitItems) {
  const batch = writeBatch(db);

  habitItems.forEach(({ id }) => {
    batch.delete(doc(db, HABIT_COLLECTION, id));
  });

  return batch.commit();
}

// Habit Option methods
export async function saveHabitOptions(params) {
  const { habitID, userID, habitOptions, id } = params;
  const hasID = Boolean(id);
  const data = {
    userID,
    habitID,
    ...habitOptions,
  };

  if (hasID) {
    return updateHabitOptions(id, habitOptions);
  } else {
    data.habitOptionsID = nanoid();

    return addHabitOptions(data);
  }
}

async function addHabitOptions(data) {
  return addDoc(collection(db, HABIT_OPTIONS_COLLECTION), data);
}

async function updateHabitOptions(id, data) {
  const docRef = doc(db, HABIT_OPTIONS_COLLECTION, id);

  return updateDoc(docRef, data);
}

export async function fetchHabitOptions(userID) {
  const habitRef = collection(db, HABIT_OPTIONS_COLLECTION);
  const q = query(habitRef, where('userID', '==', userID));

  return getDocs(q);
}
