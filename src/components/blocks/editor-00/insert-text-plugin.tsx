import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  $createParagraphNode,
  $isElementNode,
} from 'lexical';
import { $createTextNode } from 'lexical';

interface InsertTextPluginProps {
  onInsertTextReady?: (insertText: (text: string) => void) => void;
}

export function InsertTextPlugin({ onInsertTextReady }: InsertTextPluginProps): null {
  const [editor] = useLexicalComposerContext();

  const insertText = React.useCallback(
    (text: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Insert text at cursor position
          selection.insertText(text);
        } else {
          // If no selection, ensure we have one by selecting the end of the last paragraph
          const root = $getRoot();
          const lastChild = root.getLastChild();
          if (lastChild && $isElementNode(lastChild) && lastChild.getType() === 'paragraph') {
            // Select the end of the last paragraph
            lastChild.selectEnd();
            // Get the selection again after selecting
            const newSelection = $getSelection();
            if ($isRangeSelection(newSelection)) {
              newSelection.insertText(text);
            }
          } else {
            // Create a new paragraph with the text
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(text));
            root.append(paragraph);
            paragraph.selectEnd();
          }
        }
      });
      // Focus the editor after insertion
      editor.focus();
    },
    [editor]
  );

  React.useEffect(() => {
    onInsertTextReady?.(insertText);
  }, [insertText, onInsertTextReady]);

  return null;
}
