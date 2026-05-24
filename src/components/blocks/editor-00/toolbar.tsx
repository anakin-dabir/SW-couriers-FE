import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $createParagraphNode,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical';
import {
  $setBlocksType,
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from '@lexical/selection';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { $createHeadingNode, $createQuoteNode, type HeadingNode } from '@lexical/rich-text';
import { type ListNode } from '@lexical/list';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Undo,
  Redo,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';
import { $createImageNode } from './image-node';

type TextFormat = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code';
type HeadingTag = 'h1' | 'h2' | 'h3';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  separator?: boolean;
  disabled?: boolean;
}

function ToolbarButton({
  icon,
  label,
  isActive = false,
  onClick,
  separator,
  disabled = false,
}: ToolbarButtonProps): React.JSX.Element {
  if (separator) {
    return <div className="h-6 w-px bg-form-border-light mx-1" />;
  }

  return (
    <Button
      type="button"
      variant={isActive ? 'default' : 'outline'}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'h-8 w-8 rounded-md',
        isActive && 'bg-primary-500 text-white hover:bg-primary-600',
        !isActive && 'bg-white hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon}
    </Button>
  );
}

export function Toolbar(): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState(false);
  const [blockType, setBlockType] = React.useState<string>('paragraph');
  const [isUnorderedList, setIsUnorderedList] = React.useState(false);
  const [isOrderedList, setIsOrderedList] = React.useState(false);
  const [fontSize, setFontSize] = React.useState<string>('14px');
  const [textColor, setTextColor] = React.useState<string>('#000000');
  const [fontFamily, setFontFamily] = React.useState<string>('Inter');

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // Check font size from selection using Lexical's API
      const currentFontSize = $getSelectionStyleValueForProperty(selection, 'font-size', '14px');
      if (currentFontSize) {
        setFontSize(currentFontSize);
      } else {
        setFontSize('14px');
      }

      // Check text color from selection
      const currentTextColor = $getSelectionStyleValueForProperty(selection, 'color', '#000000');
      if (currentTextColor) {
        setTextColor(currentTextColor);
      } else {
        setTextColor('#000000');
      }

      // Check font family from selection
      const currentFontFamily = $getSelectionStyleValueForProperty(
        selection,
        'font-family',
        'Inter'
      );
      if (currentFontFamily) {
        // Extract font name from font-family string (e.g., "Inter, sans-serif" -> "Inter")
        const fontName = currentFontFamily.split(',')[0].replace(/['"]/g, '').trim();
        setFontFamily(fontName);
      } else {
        setFontFamily('Inter');
      }

      // Check block type
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        const typeName = element.getType();
        if (typeName === 'heading') {
          const headingNode = element as HeadingNode;
          const tag = headingNode.getTag();
          setBlockType(`heading-${tag}`);
          setIsUnorderedList(false);
          setIsOrderedList(false);
        } else if (typeName === 'list') {
          const listNode = element as ListNode;
          const listType = listNode.getListType();
          if (listType === 'bullet') {
            setIsUnorderedList(true);
            setIsOrderedList(false);
          } else if (listType === 'number') {
            setIsOrderedList(true);
            setIsUnorderedList(false);
          }
          setBlockType('list');
        } else if (typeName === 'quote') {
          setBlockType('quote');
          setIsUnorderedList(false);
          setIsOrderedList(false);
        } else {
          setBlockType('paragraph');
          setIsUnorderedList(false);
          setIsOrderedList(false);
        }
      }
    } else {
      // Reset states when no selection
      setBlockType('paragraph');
      setIsUnorderedList(false);
      setIsOrderedList(false);
      setFontSize('14px');
      setTextColor('#000000');
      setFontFamily('Inter');
    }
  }, [editor]);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  React.useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      1
    );
  }, [editor, updateToolbar]);

  const formatText = (format: TextFormat): void => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: HeadingTag): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType.startsWith('heading') && blockType === `heading-${headingSize}`) {
          // Convert back to paragraph
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          // Convert to heading
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      }
    });
  };

  const formatBulletList = (): void => {
    if (isUnorderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = (): void => {
    if (isOrderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = (): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === 'quote') {
          // Convert back to paragraph
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          // Convert to quote
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
  };

  const formatCode = (): void => {
    // Code format for inline code
    formatText('code');
  };

  const formatLink = (): void => {
    // Link formatting - simplified version
    const url = prompt('Enter URL:');
    if (url) {
      console.log('Link URL:', url);
      // TODO: Implement proper link creation using $createLinkNode from @lexical/link
    }
  };

  const formatAlign = (alignment: 'left' | 'center' | 'right'): void => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const formatFontSize = (size: string): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        // Apply font size to selected text
        $patchStyleText(selection, { 'font-size': size });
        setFontSize(size);
      } else if ($isRangeSelection(selection) && selection.isCollapsed()) {
        // If cursor is positioned but no text selected, apply to next typed text
        $patchStyleText(selection, { 'font-size': size });
        setFontSize(size);
      } else {
        // Update state even if no selection (for dropdown display)
        setFontSize(size);
      }
    });
  };

  const formatTextColor = (color: string): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        // Apply color to selected text
        $patchStyleText(selection, { color });
        setTextColor(color);
      } else if ($isRangeSelection(selection) && selection.isCollapsed()) {
        // If cursor is positioned but no text selected, apply to next typed text
        $patchStyleText(selection, { color });
        setTextColor(color);
      } else {
        // Update state even if no selection (for color picker display)
        setTextColor(color);
      }
    });
  };

  const formatFontFamily = (family: string): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        // Apply font family to selected text
        $patchStyleText(selection, { 'font-family': family });
        setFontFamily(family);
      } else if ($isRangeSelection(selection) && selection.isCollapsed()) {
        // If cursor is positioned but no text selected, apply to next typed text
        $patchStyleText(selection, { 'font-family': family });
        setFontFamily(family);
      } else {
        // Update state even if no selection (for dropdown display)
        setFontFamily(family);
      }
    });
  };

  const handleUndo = (): void => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const handleRedo = (): void => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  const handleImageUpload = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            editor.update(() => {
              const imageNode = $createImageNode({
                altText: file.name,
                src: reader.result as string,
              });
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertNodes([imageNode]);
                // Insert a paragraph after the image for better UX
                const paragraph = $createParagraphNode();
                selection.insertNodes([paragraph]);
              } else {
                // Insert at current cursor position
                const root = editor.getRootElement();
                if (root) {
                  const selection = $getSelection();
                  if (selection) {
                    selection.insertNodes([imageNode]);
                    const paragraph = $createParagraphNode();
                    selection.insertNodes([paragraph]);
                  }
                }
              }
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const fontSizes = [
    { value: '10px', label: '10px' },
    { value: '12px', label: '12px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
    { value: '18px', label: '18px' },
    { value: '20px', label: '20px' },
    { value: '24px', label: '24px' },
    { value: '28px', label: '28px' },
    { value: '32px', label: '32px' },
    { value: '36px', label: '36px' },
  ];

  const fontFamilies = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Monaco', label: 'Monaco' },
    { value: 'Lucida Console', label: 'Lucida Console' },
    { value: 'Tahoma', label: 'Tahoma' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-form-border-light bg-white px-3 py-2 rounded-t-md relative z-10 flex-wrap">
      {/* Undo/Redo */}
      <ToolbarButton icon={<Undo className="h-4 w-4" />} label="Undo" onClick={handleUndo} />
      <ToolbarButton icon={<Redo className="h-4 w-4" />} label="Redo" onClick={handleRedo} />

      <ToolbarButton icon={<div />} label="" onClick={() => {}} separator />

      {/* Text Formatting */}
      <ToolbarButton
        icon={<Bold className="h-4 w-4" />}
        label="Bold"
        isActive={isBold}
        onClick={() => formatText('bold')}
      />
      <ToolbarButton
        icon={<Italic className="h-4 w-4" />}
        label="Italic"
        isActive={isItalic}
        onClick={() => formatText('italic')}
      />
      <ToolbarButton
        icon={<Underline className="h-4 w-4" />}
        label="Underline"
        isActive={isUnderline}
        onClick={() => formatText('underline')}
      />
      <ToolbarButton
        icon={<Strikethrough className="h-4 w-4" />}
        label="Strikethrough"
        isActive={isStrikethrough}
        onClick={() => formatText('strikethrough')}
      />

      <ToolbarButton icon={<div />} label="" onClick={() => {}} separator />

      {/* Font Family */}
      <div className="flex items-center gap-1">
        <FileText className="h-4 w-4 text-form-subtitle" />
        <select
          value={fontFamily}
          onChange={(e) => {
            formatFontFamily(e.target.value);
          }}
          onBlur={() => {
            // Refocus editor after dropdown closes to maintain cursor position
            setTimeout(() => editor.focus(), 0);
          }}
          className={cn(
            'h-8 rounded-md border border-form-border-light bg-white px-2 py-1',
            'text-xs text-form-title font-normal min-w-[120px]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'cursor-pointer'
          )}
          style={{ fontFamily: fontFamily }}
          aria-label="Font Family"
        >
          {fontFamilies.map((family) => (
            <option key={family.value} value={family.value} style={{ fontFamily: family.value }}>
              {family.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="flex items-center gap-1">
        <Type className="h-4 w-4 text-form-subtitle" />
        <select
          value={fontSize}
          onChange={(e) => {
            formatFontSize(e.target.value);
          }}
          onBlur={() => {
            // Refocus editor after dropdown closes to maintain cursor position
            setTimeout(() => editor.focus(), 0);
          }}
          className={cn(
            'h-8 rounded-md border border-form-border-light bg-white px-2 py-1',
            'text-xs text-form-title font-normal',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'cursor-pointer'
          )}
          aria-label="Font Size"
        >
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* Text Color */}
      <div className="flex items-center gap-1">
        <Palette className="h-4 w-4 text-form-subtitle" />
        <div className="relative">
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              formatTextColor(e.target.value);
            }}
            onBlur={() => {
              // Refocus editor after color picker closes to maintain cursor position
              setTimeout(() => editor.focus(), 0);
            }}
            className={cn(
              'h-8 w-8 rounded-md border border-form-border-light bg-white',
              'cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
            )}
            aria-label="Text Color"
            title="Text Color"
          />
        </div>
      </div>

      <ToolbarButton icon={<div />} label="" onClick={() => {}} separator />

      {/* Headings */}
      <ToolbarButton
        icon={<Heading1 className="h-4 w-4" />}
        label="Heading 1"
        isActive={blockType === 'heading-h1'}
        onClick={() => formatHeading('h1')}
      />
      <ToolbarButton
        icon={<Heading2 className="h-4 w-4" />}
        label="Heading 2"
        isActive={blockType === 'heading-h2'}
        onClick={() => formatHeading('h2')}
      />
      <ToolbarButton
        icon={<Heading3 className="h-4 w-4" />}
        label="Heading 3"
        isActive={blockType === 'heading-h3'}
        onClick={() => formatHeading('h3')}
      />

      <ToolbarButton icon={<div />} label="" onClick={() => {}} separator />

      {/* Lists */}
      <ToolbarButton
        icon={<List className="h-4 w-4" />}
        label="Bullet List"
        isActive={isUnorderedList}
        onClick={formatBulletList}
      />
      <ToolbarButton
        icon={<ListOrdered className="h-4 w-4" />}
        label="Numbered List"
        isActive={isOrderedList}
        onClick={formatNumberedList}
      />

      <ToolbarButton icon={<div />} label="" onClick={() => {}} separator />

      {/* Other Formatting */}
      <ToolbarButton
        icon={<Quote className="h-4 w-4" />}
        label="Quote"
        isActive={blockType === 'quote'}
        onClick={formatQuote}
      />
      <ToolbarButton
        icon={<Code className="h-4 w-4" />}
        label="Code"
        isActive={false}
        onClick={formatCode}
      />
      <ToolbarButton
        icon={<Link className="h-4 w-4" />}
        label="Link"
        isActive={false}
        onClick={formatLink}
      />
      <ToolbarButton
        icon={<ImageIcon className="h-4 w-4" />}
        label="Insert Image"
        isActive={false}
        onClick={handleImageUpload}
      />

      <ToolbarButton icon={<div />} label="" onClick={() => {}} separator />

      {/* Alignment */}
      <ToolbarButton
        icon={<AlignLeft className="h-4 w-4" />}
        label="Align Left"
        isActive={false}
        onClick={() => formatAlign('left')}
      />
      <ToolbarButton
        icon={<AlignCenter className="h-4 w-4" />}
        label="Align Center"
        isActive={false}
        onClick={() => formatAlign('center')}
      />
      <ToolbarButton
        icon={<AlignRight className="h-4 w-4" />}
        label="Align Right"
        isActive={false}
        onClick={() => formatAlign('right')}
      />
    </div>
  );
}
