import React from 'react';
// import examples from './templates.json';
import ExampleQueryView from './ExampleQueryView';
import { TemplatesArray } from './types';
import { parse } from 'yaml';

interface ExampleQueriesTabProps {
  onTemplateCompletionChange?: (isComplete: boolean) => void;
}

function ExamplesTab({ onTemplateCompletionChange }: ExampleQueriesTabProps) {
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
