import React from "react";

interface BiolinkContextType {
  colorMap?: (categories: string | string[]) => [string | null, string];
  hierarchies?: Record<string, any>;
}

const BiolinkContext = React.createContext<BiolinkContextType>({});

export default BiolinkContext;
