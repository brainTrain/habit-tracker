import PropTypes from 'prop-types';
import { registerUserEmail } from './firebase/auth';

const EMAIL_INPUT_ID = 'register-email-input';
const PASSWORD_INPUT_ID = 'register-password-input';

function Register({ onRegisterSuccess, onRegisterError }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const isFormValid = event.target.checkValidity();

    if (isFormValid) {
      const email = event.target.querySelector(`#${EMAIL_INPUT_ID}`).value;
      const password = event.target.querySelector(
        `#${PASSWORD_INPUT_ID}`,
      ).value;
      registerUserEmail(email, password)
        .then((userCredential) => {
          onRegisterSuccess(userCredential);
        })
        .catch((error) => {
          onRegisterError(error);
        });
    }
  };

  return (
    <div>
      <form id="register-form" onSubmit={handleSubmit}>
        <input
          id={EMAIL_INPUT_ID}
          name="register-email"
          type="email"
          placeholder="Enter email"
          required
        />
        <input
          id={PASSWORD_INPUT_ID}
          name="register-password"
          type="password"
          placeholder="Enter Password"
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

Register.propTypes = {
  onRegisterSuccess: PropTypes.func,
  onRegisterError: PropTypes.func,
};

Register.defaultProps = {
  onRegisterSuccess: function () {
    console.warn(
      'onRegisterSuccess() prop in <Register /> component called without a value',
    );
  },
  onRegisterError: function () {
    console.warn(
      'onRegisterError() prop in <Register /> component called without a value',
    );
  },
};

export default Register;
