import React, { createContext, useContext, useMemo, useState } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { SearchSheet } from '../components/search/SearchSheet';
import type { RootTabParamList } from '../navigation/types';

interface SearchApi {
  open: () => void;
}

interface SearchProviderProps {
  navigationRef: NavigationContainerRefWithCurrent<RootTabParamList>;
  children: React.ReactNode;
}

const SearchContext = createContext<SearchApi>({ open: () => {} });

// Busca universal disponível em qualquer tela via useSearch().open().
export function SearchProvider({ navigationRef, children }: SearchProviderProps) {
  const [visible, setVisible] = useState(false);
  const value = useMemo<SearchApi>(() => ({ open: () => setVisible(true) }), []);
  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchSheet visible={visible} onClose={() => setVisible(false)} navigationRef={navigationRef} />
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
