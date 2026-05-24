'use client';

import * as React from 'react';
import type { EditorState, SerializedEditorState } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { TooltipProvider } from '@/components/atoms/tooltip';
import { editorTheme } from './editor-theme';
import { nodes } from './nodes';
import { Plugins } from './plugins';

const editorConfig = {
  namespace: 'Editor',
  theme: editorTheme,
  nodes,
  editable: true,
  onError: (error: Error) => {
    console.error(error);
  },
};

interface EditorProps {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  placeholder?: string;
  className?: string;
  onInsertTextReady?: (insertText: (text: string) => void) => void;
  sidePanel?: React.ReactNode;
}

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  placeholder = 'Start typing...',
  className,
  onInsertTextReady,
  sidePanel,
}: EditorProps): React.JSX.Element {
  return (
    <div className={className}>
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
        }}
      >
        <TooltipProvider>
          <Plugins
            placeholder={placeholder}
            initialSerializedState={editorSerializedState}
            onInsertTextReady={onInsertTextReady}
            sidePanel={sidePanel}
          />
          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState);
              onSerializedChange?.(editorState.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
