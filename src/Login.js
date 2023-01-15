import { loginUserEmail } from './firebase/auth';
const EMAIL_INPUT_ID = 'login-email-input';
const PASSWORD_INPUT_ID = 'login-password-input';

function Login() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const isFormValid = event.target.checkValidity();
    if (isFormValid) {
      const email = event.target.querySelector(`#${EMAIL_INPUT_ID}`).value;
      const password = event.target.querySelector(
        `#${PASSWORD_INPUT_ID}`,
      ).value;
      console.log('email:login', email);
      console.log('password:login', password);
      loginUserEmail(email, password);
    }
  };

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
