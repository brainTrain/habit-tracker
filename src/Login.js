// libraries
import { useCallback } from 'react';
import PropTypes from 'prop-types';
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

Login.propTypes = {
  onLoginSuccess: PropTypes.func,
  onLoginError: PropTypes.func,
};

Login.defaultProps = {
  onLoginSuccess: function () {
    console.warn(
      'onLoginSuccess() prop in <Login /> component called without a value',
    );
  },
  onLoginError: function () {
    console.warn(
      'onLoginError() prop in <Login /> component called without a value',
    );
  },
};

export default Login;
