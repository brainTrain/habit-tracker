import { registerUserEmail } from './firebase/auth';

const EMAIL_INPUT_ID = 'register-email-input';
const PASSWORD_INPUT_ID = 'register-password-input';

function Register({ onRegisterSuccess, onRegisterError }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('event:register', event);
    const isFormValid = event.target.checkValidity();
    if (isFormValid) {
      const email = event.target.querySelector(`#${EMAIL_INPUT_ID}`).value;
      const password = event.target.querySelector(
        `#${PASSWORD_INPUT_ID}`,
      ).value;
      console.log('email:login', email);
      console.log('password:login', password);
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

export default Register;
