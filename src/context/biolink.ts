import React from "react";

interface BiolinkContextType {
  colorMap?: (categories: string | string[]) => [string | null, string];
  hierarchies?: Record<string, any>;
  concepts?: string[];
  predicates?: {
    domain: string;
    predicate: string;
    range: string;
    symmetric: boolean;
  }[]
}

const BiolinkContext = React.createContext<BiolinkContextType>({});

export default BiolinkContext;
