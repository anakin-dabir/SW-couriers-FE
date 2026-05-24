import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $isTextNode, $isElementNode, type LexicalNode } from 'lexical';
import { cn } from '@/lib/utils';

export function EditorFooter(): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [characterCount, setCharacterCount] = React.useState(0);
  const [wordCount, setWordCount] = React.useState(0);

  const updateCounts = React.useCallback(() => {
    editor.getEditorState().read(() => {
      const root = $getRoot();
      let totalCharacters = 0;
      let allText = '';

      // Recursive function to traverse all nodes
      const traverseNode = (node: LexicalNode): void => {
        if ($isTextNode(node)) {
          const text = node.getTextContent();
          allText += text + ' ';
          totalCharacters += text.length;
        } else if ($isElementNode(node)) {
          // For element nodes, traverse children
          const children = node.getChildren();
          children.forEach((child: LexicalNode) => {
            traverseNode(child);
          });
        }
      };

      // Traverse all root children
      root.getChildren().forEach((node: LexicalNode) => {
        traverseNode(node);
      });

      // Count words (split by whitespace and filter empty strings)
      const trimmedText = allText.trim();
      const words =
        trimmedText.length > 0 ? trimmedText.split(/\s+/).filter((word) => word.length > 0) : [];
      const totalWords = words.length;

      setCharacterCount(totalCharacters);
      setWordCount(totalWords);
    });
  }, [editor]);

  React.useEffect(() => {
    // Initial count
    updateCounts();

    // Update counts on editor changes
    return editor.registerUpdateListener(() => {
      updateCounts();
    });
  }, [editor, updateCounts]);

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-4 px-3 py-2',
        'border-t border-form-border-light bg-white',
        'text-xs text-form-subtitle'
      )}
    >
      <div className="flex items-center gap-1">
        <span className="font-medium">Characters:</span>
        <span className="text-form-title">{characterCount.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium">Words:</span>
        <span className="text-form-title">{wordCount.toLocaleString()}</span>
      </div>
    </div>
  );
}
