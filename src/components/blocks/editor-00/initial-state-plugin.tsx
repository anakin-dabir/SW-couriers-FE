import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import type { SerializedEditorState } from 'lexical';

interface InitialStatePluginProps {
  initialSerializedState?: SerializedEditorState;
}

interface SerializedParagraph {
  type: string;
  children?: SerializedTextNode[];
}

interface SerializedTextNode {
  type: string;
  text?: string;
}

export function InitialStatePlugin({ initialSerializedState }: InitialStatePluginProps): null {
  const [editor] = useLexicalComposerContext();
  const [hasInitialized, setHasInitialized] = React.useState(false);

  React.useEffect(() => {
    if (initialSerializedState && !hasInitialized) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        if (initialSerializedState.root?.children) {
          initialSerializedState.root.children.forEach((child: SerializedParagraph) => {
            if (child.type === 'paragraph') {
              const paragraph = $createParagraphNode();
              if (child.children && child.children.length > 0) {
                child.children.forEach((textChild: SerializedTextNode) => {
                  if (textChild.type === 'text' && textChild.text) {
                    paragraph.append($createTextNode(textChild.text));
                  }
                });
              }
              root.append(paragraph);
            }
          });
        }
      });
      setHasInitialized(true);
    }
  }, [editor, initialSerializedState, hasInitialized]);

  return null;
}
