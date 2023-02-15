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

// media query dimensions and tactic lovingly lifted from
// https://jsramblings.com/how-to-use-media-queries-with-styled-components/
export const mediaQuerySize = {
  mobileS: '320px',
  mobileM: '375px',
  mobileL: '425px',
  mobileXL: '550px',
  tablet: '768px',
  laptop: '1024px',
  laptopL: '1440px',
  desktop: '2560px',
};

export const mediaQueryDevice = {
  mobileS: `(min-width: ${mediaQuerySize.mobileS})`,
  mobileM: `(min-width: ${mediaQuerySize.mobileM})`,
  mobileL: `(min-width: ${mediaQuerySize.mobileL})`,
  mobileXL: `(min-width: ${mediaQuerySize.mobileXL})`,
  tablet: `(min-width: ${mediaQuerySize.tablet})`,
  laptop: `(min-width: ${mediaQuerySize.laptop})`,
  laptopL: `(min-width: ${mediaQuerySize.laptopL})`,
  desktop: `(min-width: ${mediaQuerySize.desktop})`,
  desktopL: `(min-width: ${mediaQuerySize.desktop})`,
};
