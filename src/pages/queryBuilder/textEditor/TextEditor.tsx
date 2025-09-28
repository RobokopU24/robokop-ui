import React from 'react';

import TextEditorRow from './textEditorRow/TextEditorRow';
import { TextEditorRowProps } from './types';

/**
 * Query Builder text editor interface
 */
interface TextEditorProps {
  rows: TextEditorRowProps[];
}

export default function TextEditor({ rows }: TextEditorProps) {
  return (
    <div id="queryTextEditor">
      {rows.map((row: TextEditorRowProps, i: number) => (
        <TextEditorRow key={row.edgeId} row={row} index={i} />
      ))}
    </div>
  );
}
