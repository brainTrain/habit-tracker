import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import styled from 'styled-components';
import './App.css';
import Login from './Login';
import Register from './Register';
import Habits from './Habits';

const AUTH_LOADING = 'auth-loading';
const AUTH_LOADED_AUTHENTICATED = 'auth-loaded-authenticated';
const AUTH_LOADED_NOT_AUTHENTICATED = 'auth-loaded-not-authenticated';
const AUTH_LOADED_ERROR = 'auth-loaded-error';

const AppWrapper = styled.main`
  padding: 0 2rem;
`;

function App() {
  const [authState, setAuthState] = useState(AUTH_LOADING);
  const [userID, setUserID] = useState('');
  const [userEmail, setUserEmail] = useState('');

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

  const handleLoginSuccess = () => {
    setAuthState(AUTH_LOADED_AUTHENTICATED);
  };

  const handleLoginError = (error) => {
    console.error('login error', error);
    setAuthState(AUTH_LOADED_ERROR);
  };

  const handleRegisterSuccess = () => {
    setAuthState(AUTH_LOADED_AUTHENTICATED);
    setAuthState(AUTH_LOADED_AUTHENTICATED);
  };

  const handleRegisterError = (error) => {
    console.error('register error', error);
    setAuthState(AUTH_LOADED_ERROR);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setAuthState(AUTH_LOADED_NOT_AUTHENTICATED);
      })
      .catch((error) => {
        console.error('logout error', error);
        setAuthState(AUTH_LOADED_ERROR);
      });
  };

  return (
    <div className="App">
      <AppWrapper>
        {{
          [AUTH_LOADING]: <p>loading...</p>,
          [AUTH_LOADED_AUTHENTICATED]: (
            <Habits userID={userID} userEmail={userEmail} />
          ),
          [AUTH_LOADED_NOT_AUTHENTICATED]: (
            <>
              <section>
                <h3>Login</h3>
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  onLoginError={handleLoginError}
                />
              </section>
              <section>
                <h3>Register</h3>
                <Register
                  onRegisterSuccess={handleRegisterSuccess}
                  onRegisterError={handleRegisterError}
                />
              </section>
            </>
          ),
        }[authState] || <p>Error</p>}
        {authState === AUTH_LOADED_AUTHENTICATED ? (
          <button onClick={handleLogout} style={{ marginTop: '20rem' }}>
            logout
          </button>
        ) : null}
      </AppWrapper>
    </div>
  );
}

export default App;
