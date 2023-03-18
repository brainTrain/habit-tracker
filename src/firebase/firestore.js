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
  deleteDoc,
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
export const CREATE_HABIT_OPTIONS = 'create-habit-options';
export const UPDATE_HABIT_OPTIONS = 'update-habit-options';

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

// NOTE: not consumed anywhere, but considering a flow where I just re-fetch one habit group
export async function fetchHabitGroup(habitID) {
  const habitRef = collection(db, HABIT_COLLECTION);
  const q = query(habitRef, where('habitID', '==', habitID));

  return getDocs(q);
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

// TODO FIRST: see if websockets will be a better option for what I'm trying to do with checksums
// TODO: Try a checksum for possibly cheaper lookup for habits to determine if a fetch is needed or not
// possible steps:
// * get list of habit IDs for habit group
// * TODO: decide if habit options make sense there too
// * possible data shape:
//    const checksumData = {
//      habitID: 'fasdff-22fasdf-2fasdf',
//      habitDocumentIDs: ['fasd-fafsf-fdaf', 'fasdf-fsdfsd-fsdfsf'],
//    }
//  * if a habit document is deleted or added the checksum should be different
//  * const hash = await crypto.subtle.digest('SHA-256', data);
//  * check habit options checksum, compare it with hash var
//  * if same, do nothing
//  * if different, fetch habits
//  * once habits have been fetched, create a new checksumData obj with new data
//  * create new hash with new checksumData obj
//  * update habit options for that habit with new checksum

// example from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#basic_example
/*
const text =
  "An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth.";

async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
}

digestMessage(text).then((digestBuffer) =>
  console.log(digestBuffer.byteLength)
);

*/

// Habit Option methods
export async function saveHabitOptions(params) {
  const { habitID, userID, habitOptions, id } = params;
  const hasID = Boolean(id);
  const data = {
    userID,
    habitID,
    ...habitOptions,
  };
  let habitOptionsResponse = {};
  if (hasID) {
    const { docRef, docSnapshot } = await updateHabitOptions(id, habitOptions);
    // TODO: this is silly lol
    habitOptionsResponse = {
      docRef,
      habitOptionsDocument: {
        ...docSnapshot.data(),
        id: docSnapshot.id,
      },
      operation: UPDATE_HABIT_OPTIONS,
    };
  } else {
    data.habitOptionsID = nanoid();
    const { docRef, docSnapshot } = await addHabitOptions(data);
    habitOptionsResponse = {
      docRef,
      habitOptionsDocument: {
        ...docSnapshot.data(),
        id: docSnapshot.id,
      },
      operation: CREATE_HABIT_OPTIONS,
    };
  }

  return habitOptionsResponse;
}

async function addHabitOptions(data) {
  const docRef = await addDoc(collection(db, HABIT_OPTIONS_COLLECTION), data);
  const docSnapshot = await getDoc(docRef);

  return { docRef, docSnapshot };
}

async function updateHabitOptions(id, data) {
  const docRef = await doc(db, HABIT_OPTIONS_COLLECTION, id);
  await updateDoc(docRef, data);
  const docSnapshot = await getDoc(docRef);

  return {
    docRef,
    docSnapshot,
  };
}

export async function deleteHabitOptions(id) {
  const docRef = doc(db, HABIT_OPTIONS_COLLECTION, id);

  return await deleteDoc(docRef);
}

export async function fetchHabitOptions(userID) {
  const habitRef = collection(db, HABIT_OPTIONS_COLLECTION);
  const q = query(habitRef, where('userID', '==', userID));

  return getDocs(q);
}
