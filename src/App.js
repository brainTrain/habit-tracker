import './App.css';
import { getIsLoggedIn } from './firebase/auth';
import Login from './Login';
import Register from './Register';

function App() {
  const isLoggedIn = getIsLoggedIn();

  return (
    <div className="App">
      {isLoggedIn ? (
        <p>ohhai user</p>
      ) : (
        <main>
          <section>
            <h3>Login</h3>
            <Login />
          </section>
          <section>
            <h3>Register</h3>
            <Register />
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
