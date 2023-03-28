import styled from 'styled-components';
// utils
import { habitDetailsGutterPadding } from './layout';
// reusable component styles
export const MenuButton = styled.button`
  font-size: 1rem;
  height: 2rem;
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const MenuHeaderTop = styled.section`
  display: flex;
  justify-content: space-between;
`;

export const HabitLabel = styled.h3`
  margin: 0;
`;

export const HabitCurrentDate = styled.h4`
  margin: 0;
`;

export const MenuHeader = styled.section`
  display: flex;
  flex-direction: column;

  ${habitDetailsGutterPadding};
  padding-bottom: 1rem;
`;
