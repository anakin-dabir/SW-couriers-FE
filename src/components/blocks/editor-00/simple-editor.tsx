'use client';

import * as React from 'react';
import type { EditorState, SerializedEditorState } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { TooltipProvider } from '@/components/atoms/tooltip';
import { editorTheme } from './editor-theme';
import { nodes } from './nodes';
import { cn } from '@/lib/utils';
import { SimplePlugins } from './simple-plugins';

const editorConfig = {
  namespace: 'SimpleEditor',
  theme: editorTheme,
  nodes,
  editable: true,
  onError: (error: Error) => {
    console.error(error);
  },
};

interface SimpleEditorProps {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  placeholder?: string;
  className?: string;
  onInsertTextReady?: (insertText: (text: string) => void) => void;
  fillHeight?: boolean;
}

export function SimpleEditor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  placeholder = 'Start typing...',
  className,
  onInsertTextReady,
  fillHeight = false,
}: SimpleEditorProps): React.JSX.Element {
  return (
    <div className={cn(className, fillHeight && 'flex min-h-0 flex-1 flex-col')}>
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
        }}
      >
        <TooltipProvider>
          <SimplePlugins
            placeholder={placeholder}
            initialSerializedState={editorSerializedState}
            onInsertTextReady={onInsertTextReady}
            fillHeight={fillHeight}
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
