import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { COMMAND_PRIORITY_LOW, $getSelection, $isRangeSelection, $insertNodes } from 'lexical';
import { ImageNode, $createImageNode } from './image-node';

export function ImagesPlugin(): null {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor');
    }
  }, [editor]);

  React.useEffect(() => {
    return editor.registerCommand<DragEvent>(
      DRAG_DROP_PASTE,
      (event) => {
        const files = event.dataTransfer?.files;
        if (files !== null && files !== undefined) {
          const fileList = Array.from(files);
          fileList.forEach((file) => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                  editor.update(() => {
                    const imageNode = $createImageNode({
                      altText: file.name,
                      src: result,
                    });
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      $insertNodes([imageNode]);
                    } else {
                      // If no selection, insert at root using $insertNodes
                      $insertNodes([imageNode]);
                    }
                  });
                }
              };
              reader.readAsDataURL(file);
            }
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
