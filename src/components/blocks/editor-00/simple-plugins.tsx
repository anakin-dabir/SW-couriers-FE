import * as React from 'react';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ImagesPlugin } from './images-plugin';
import { InitialStatePlugin } from './initial-state-plugin';
import { InsertTextPlugin } from './insert-text-plugin';
import { EditorFooter } from './editor-footer';
import { cn } from '@/lib/utils';
import type { SerializedEditorState } from 'lexical';

interface SimplePluginsProps {
  placeholder?: string;
  initialSerializedState?: SerializedEditorState;
  onInsertTextReady?: (insertText: (text: string) => void) => void;
  fillHeight?: boolean;
}

export function SimplePlugins({
  placeholder = 'Start typing...',
  initialSerializedState,
  onInsertTextReady,
  fillHeight = false,
}: SimplePluginsProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-hidden rounded-md border border-form-border-light',
        fillHeight && 'min-h-0 flex-1'
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          fillHeight ? 'min-h-0 flex-1' : 'max-h-[300px] min-h-[150px] flex-1'
        )}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cn(
                'relative w-full bg-form-surface px-3 py-3',
                'text-sm font-normal leading-relaxed text-form-title',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'outline-none',
                'overflow-y-auto overflow-x-hidden',
                'overflow-wrap-break-word break-words',
                'cursor-text',
                fillHeight ? 'min-h-full h-full' : 'min-h-[150px]'
              )}
              style={{
                lineHeight: '1.6',
                ...(fillHeight ? {} : { maxHeight: '300px' }),
              }}
            />
          }
          placeholder={
            <div className="editor-placeholder pointer-events-none absolute top-3 left-3 text-form-placeholder text-sm">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ImagesPlugin />
      {onInsertTextReady && <InsertTextPlugin onInsertTextReady={onInsertTextReady} />}
      {initialSerializedState && (
        <InitialStatePlugin initialSerializedState={initialSerializedState} />
      )}
      <EditorFooter />
    </div>
  );
}
