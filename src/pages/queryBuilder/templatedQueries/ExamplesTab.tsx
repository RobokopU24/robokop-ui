import React from 'react';
import examples from './templates.json';
import ExampleQueryView from './ExampleQueryView';
import { TemplatesArray } from './types';

interface ExampleQueriesTabProps {
  onTemplateCompletionChange?: (isComplete: boolean) => void;
}

function ExamplesTab({ onTemplateCompletionChange }: ExampleQueriesTabProps) {
  const exampleQueries = (examples as unknown as TemplatesArray).filter(
    (example) => example.type === 'example'
  );
  return (
    <ExampleQueryView
      examples={exampleQueries}
      onTemplateCompletionChange={onTemplateCompletionChange}
    />
  );
}

export default ExamplesTab;
