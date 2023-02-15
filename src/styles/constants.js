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

export const fontWeight = {
  regular: 400,
  medium: 500,
  semiBold: 600,
};
