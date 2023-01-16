// libraries
import { useCallback } from 'react';
import { loginUserEmail } from './firebase/auth';
// constants
const EMAIL_INPUT_ID = 'login-email-input';
const PASSWORD_INPUT_ID = 'login-password-input';

function Login({ onLoginSuccess, onLoginError }) {
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const isFormValid = event.target.checkValidity();
      if (isFormValid) {
        const email = event.target.querySelector(`#${EMAIL_INPUT_ID}`).value;
        const password = event.target.querySelector(
          `#${PASSWORD_INPUT_ID}`,
        ).value;

        loginUserEmail(email, password)
          .then((userCredential) => {
            onLoginSuccess(userCredential);
          })
          .catch((error) => {
            onLoginError(error);
          });
      }
    },
    [onLoginSuccess, onLoginError],
  );

  return (
    <div>
      <form id="login-form" onSubmit={handleSubmit}>
        <input
          id={EMAIL_INPUT_ID}
          name="login-email"
          type="email"
          placeholder="Enter email"
          required
        />
        <input
          id={PASSWORD_INPUT_ID}
          name="login-password"
          type="password"
          placeholder="Enter Password"
          required
        />
        <button type="submit">login</button>
      </form>
    </div>
  );
}

export default Login;
