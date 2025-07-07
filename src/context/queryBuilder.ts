import React from "react";
import { QueryBuilderContextType } from "../pages/queryBuilder/textEditor/types";

const QueryBuilderContext = React.createContext<QueryBuilderContextType>({} as QueryBuilderContextType);

export default QueryBuilderContext;
