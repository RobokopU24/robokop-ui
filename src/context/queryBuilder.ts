import React, { createContext, useContext } from 'react';
import { QueryBuilderContextType } from '../pages/queryBuilder/textEditor/types';
import useQueryBuilder from '../pages/queryBuilder/useQueryBuilder';

const QueryBuilderContext = createContext<QueryBuilderContextType>({} as QueryBuilderContextType);

interface QueryBuilderProviderProps {
  children: React.ReactNode;
}

export const QueryBuilderProvider: React.FC<QueryBuilderProviderProps> = ({ children }) => {
  const queryBuilder = useQueryBuilder();

  return React.createElement(QueryBuilderContext.Provider, { value: queryBuilder }, children);
};

export const useQueryBuilderContext = () => {
  const context = useContext(QueryBuilderContext);
  if (!context) {
    throw new Error('useQueryBuilderContext must be used within a QueryBuilderProvider');
  }
  return context;
};

export default QueryBuilderContext;
