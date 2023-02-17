import { createGlobalStyle } from 'styled-components';
import '../../node_modules/@syncfusion/ej2-base/styles/material.css';
import '../../node_modules/@syncfusion/ej2-buttons/styles/material.css';
import '../../node_modules/@syncfusion/ej2-react-calendars/styles/material.css';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Sora', sans-serif;
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
