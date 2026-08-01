import React, { createContext, useContext, useState } from 'react';

const LayoutContext = createContext({ landscape: false, setLandscape: () => {} });

export function LayoutProvider({ children }) {
  const [landscape, setLandscape] = useState(false);
  return (
    <LayoutContext.Provider value={{ landscape, setLandscape }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}