import { createContext } from 'react';

export const ActiveSectionContext = createContext({
  activeSection: 'overview',
  setActiveSection: () => {},
});
