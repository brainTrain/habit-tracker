import { css } from 'styled-components';

const APP_GUTTER_WIDTH = '1rem';
const HABIT_DETIALS_GUTTER_WIDTH = '1rem';

export const appGutterMargin = css`
  margin: 0 ${APP_GUTTER_WIDTH};
`;

export const appGutterPadding = css`
  padding: 0 ${APP_GUTTER_WIDTH};
`;

export const habitDetailsGutterMargin = css`
  margin: 0 ${HABIT_DETIALS_GUTTER_WIDTH};
`;

export const habitDetailsGutterPadding = css`
  padding: 0 ${HABIT_DETIALS_GUTTER_WIDTH};
`;
