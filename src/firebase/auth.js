import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

export function registerUserEmail(email, password) {
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('success:register:userCredential', userCredential);
      // Signed in
      const user = userCredential.user;
    })
    .catch((error) => {
      console.log('error:register:userCredential', error);
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

export function loginUserEmail(email, password) {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log('success:login:userCredential', userCredential);
      // ...
    })
    .catch((error) => {
      console.log('error:login:userCredential', error);
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

export function getIsLoggedIn() {
  const auth = getAuth();
  return auth.currentUser;
}
