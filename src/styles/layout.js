import { css } from 'styled-components';

export const APP_GUTTER_WIDTH = '1rem';
export const HABIT_DETIALS_GUTTER_WIDTH = '1rem';
export const MAX_PAGE_WIDTH = '1500px';
export const TOP_BOTTOM_PAGE_GUTTER = '2rem';

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
