import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical';
import { $isImageNode } from './image-node';
import { cn } from '@/lib/utils';

interface ImageComponentProps {
  src: string;
  altText: string;
  width: 'inherit' | number;
  height: 'inherit' | number;
  maxWidth: number;
  nodeKey: string;
}

export function ImageComponent({
  src,
  altText,
  width,
  height,
  maxWidth,
  nodeKey,
}: ImageComponentProps): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = React.useState(false);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const [isFocused, setIsFocused] = useLexicalNodeSelection(nodeKey);

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
        }
      }
      return false;
    },
    [isSelected, nodeKey]
  );

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const node = $getNodeByKey(nodeKey);
          if (node === null) {
            return;
          }
          const selection = $getSelection();
          const isNodeSelection = $isNodeSelection(selection);
          setIsSelected(isNodeSelection && selection.getNodes().includes(node));
        });
      }),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setIsFocused(!isFocused);
            } else {
              setIsFocused(true);
            }
            if (event.target === imageRef.current) {
              event.preventDefault();
            }
            return true;
          }

          return false;
        },
        1
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, 2),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, 2)
    );
  }, [editor, isFocused, isSelected, nodeKey, onDelete, setIsFocused]);

  const imageStyle = {
    maxWidth: `${maxWidth}px`,
    width: width === 'inherit' ? 'inherit' : `${width}px`,
    height: height === 'inherit' ? 'inherit' : `${height}px`,
  };

  return (
    <span
      className={cn('editor-image', isFocused && 'focused')}
      style={{ display: 'inline-block', position: 'relative' }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        style={imageStyle}
        className={cn('editor-image-img', isFocused && 'focused')}
        draggable="false"
      />
    </span>
  );
}
