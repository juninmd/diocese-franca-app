import React, { createContext, useContext, useMemo, useState } from 'react';
import { SearchSheet } from '../components/search/SearchSheet';

const SearchContext = createContext({ open: () => {} });

// Busca universal disponível em qualquer tela via useSearch().open().
export function SearchProvider({ navigationRef, children }) {
  const [visible, setVisible] = useState(false);
  const value = useMemo(() => ({ open: () => setVisible(true) }), []);
  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchSheet visible={visible} onClose={() => setVisible(false)} navigationRef={navigationRef} />
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
