import React from 'react';
// import examples from './templates.json';
import ExampleQueryView from './ExampleQueryView';
import { TemplatesArray } from './types';
import { parse } from 'yaml';

interface ExampleQueriesTabProps {
  onTemplateCompletionChange?: (isComplete: boolean) => void;
}

function ExampleQueriesTab({ onTemplateCompletionChange }: ExampleQueriesTabProps) {
  const [examples, setExamples] = React.useState<TemplatesArray>([]);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/templates.yaml');
        const text = await res.text();
        const data = parse(text) as TemplatesArray;
        setExamples(data);
      } catch (e: any) {
        console.log(e.message);
      }
    })();
  }, []);
  const templateQueries = (examples as unknown as TemplatesArray).filter(
    (example) => example.type === 'template'
  );
  return (
    <ExampleQueryView
      examples={templateQueries}
      onTemplateCompletionChange={onTemplateCompletionChange}
    />
  );
}

export default ExampleQueriesTab;
