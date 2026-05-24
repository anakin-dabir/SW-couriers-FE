import * as React from 'react';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { Toolbar } from './toolbar';
import { ImagesPlugin } from './images-plugin';
import { EditorFooter } from './editor-footer';
import { InitialStatePlugin } from './initial-state-plugin';
import { InsertTextPlugin } from './insert-text-plugin';
import { cn } from '@/lib/utils';
import type { SerializedEditorState } from 'lexical';

interface PluginsProps {
  placeholder?: string;
  initialSerializedState?: SerializedEditorState;
  onInsertTextReady?: (insertText: (text: string) => void) => void;
  sidePanel?: React.ReactNode;
}

export function Plugins({
  placeholder = 'Start typing...',
  initialSerializedState,
  onInsertTextReady,
  sidePanel,
}: PluginsProps): React.JSX.Element {
  return (
    <div className="relative w-full border border-form-border-light rounded-md overflow-hidden flex flex-col">
      <Toolbar />
      <div
        className={cn(
          'grid gap-3 border-t border-form-border-light bg-[#F8FAFC] p-3',
          sidePanel ? 'md:grid-cols-[220px_minmax(0,1fr)]' : 'grid-cols-1'
        )}
      >
        {sidePanel ? (
          <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-md border border-[#E5E7EB] bg-white p-3">
            {sidePanel}
          </div>
        ) : null}

        <div className="relative flex-1 min-h-[200px] max-h-[360px] overflow-y-auto rounded-md border border-[#E5E7EB] bg-white">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  'relative min-h-[200px] w-full bg-form-surface px-3 py-3',
                  'text-sm text-form-title font-normal leading-relaxed',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                  'outline-none',
                  'overflow-y-auto overflow-x-hidden',
                  'overflow-wrap-break-word',
                  'word-break-break-word',
                  'cursor-text'
                )}
                style={{
                  lineHeight: '1.6',
                  maxHeight: '500px',
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
