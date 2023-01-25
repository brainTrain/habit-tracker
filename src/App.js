// libraries
import { useCallback, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import styled from 'styled-components';
// import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
// utils
import GlobalStyle from './styles/globalStyles';
// components
import Login from './Login';
import Register from './Register';
import Habits from './Habits';
// constants
const AUTH_LOADING = 'auth-loading';
const AUTH_LOADED_AUTHENTICATED = 'auth-loaded-authenticated';
const AUTH_LOADED_NOT_AUTHENTICATED = 'auth-loaded-not-authenticated';
// TODO: need to figure out if I need this, wanna have this general error state
const AUTH_LOADED_ERROR = 'auth-loaded-error';
// styles
const AppWrapper = styled.main`
  height: 100%;
`;

function App() {
  const [authState, setAuthState] = useState(AUTH_LOADING);
  const [userID, setUserID] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [hasLoginError, setHasLoginError] = useState(false);
  const [hasRegisterError, setHasRegisterError] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthState(AUTH_LOADED_AUTHENTICATED);
        setUserID(user.uid);
        setUserEmail(user.email);
      } else {
        setUserID('');
        setAuthState(AUTH_LOADED_NOT_AUTHENTICATED);
        setUserEmail('');
      }
    });
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setAuthState(AUTH_LOADED_AUTHENTICATED);
    setHasLoginError(false);
  }, []);

  const handleLoginError = useCallback((error) => {
    console.error('login error', error.message);
    setHasLoginError(true);
  }, []);

  const handleRegisterSuccess = useCallback(() => {
    setAuthState(AUTH_LOADED_AUTHENTICATED);
    setHasRegisterError(false);
  }, []);

  const handleRegisterError = useCallback((error) => {
    console.error('register error', error.message);
    setHasRegisterError(true);
  }, []);

  const handleLogout = useCallback(() => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setAuthState(AUTH_LOADED_NOT_AUTHENTICATED);
      })
      .catch((error) => {
        console.error('logout error', error.message);
        setAuthState(AUTH_LOADED_ERROR);
      });
  }, []);

  return (
    <>
      <GlobalStyle />
      <AppWrapper>
        {{
          [AUTH_LOADING]: <p>loading...</p>,
          [AUTH_LOADED_AUTHENTICATED]: (
            <Habits
              userID={userID}
              userEmail={userEmail}
              onLogout={handleLogout}
            />
          ),
          [AUTH_LOADED_NOT_AUTHENTICATED]: (
            <>
              <section>
                <h3>Login</h3>
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  onLoginError={handleLoginError}
                />
                {hasLoginError ? <p>Error logging in :(</p> : null}
              </section>
              <section>
                <h3>Register</h3>
                <Register
                  onRegisterSuccess={handleRegisterSuccess}
                  onRegisterError={handleRegisterError}
                />
                {hasRegisterError ? <p>Error logging in :(</p> : null}
              </section>
            </>
          ),
        }[authState] || <p>Error :(</p>}
      </AppWrapper>
    </>
  );
}
export default App;
