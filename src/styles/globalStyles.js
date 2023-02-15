import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
  }
  
  * {
    box-sizing: border-box;
  }

  form input {
    font-size: 16px;
  }

  form button {
    font-size: 16px;
  }

  button {
    cursor: pointer;
  }

  p {
    margin: 0;
  }
`;

export default GlobalStyle;
