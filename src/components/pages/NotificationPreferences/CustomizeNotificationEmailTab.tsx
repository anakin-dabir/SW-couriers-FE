import * as React from 'react';
import { useState, useMemo, useRef, useCallback } from 'react';
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/badge';
import { Typography } from '@/components/atoms';
import { Editor } from '@/components/blocks/editor-00/editor';
import type { SerializedEditorState } from 'lexical';

const DEFAULT_EMAIL_BODY = `Dear {customer full name},

We're excited to inform you that your order {order ID} is now out for delivery.

Order Details:
Delivery Address: {delivery address}
Package Weight: {package weight}
Estimated Delivery Date: {delivery date}

Our delivery partner will contact you if needed. Please ensure someone is available at the delivery address to receive your package.

Thank you for choosing SW Carriers.

Best regards,
XYZ Offers`;

// Helper function to create a serialized editor state from text
const createDefaultEditorState = (text: string): SerializedEditorState => {
  // Split text into lines and create paragraphs
  const lines = text.split('\n');
  const children = lines.map((line) => {
    if (line.trim() === '') {
      return {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      };
    }
    return {
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: line,
          type: 'text',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    };
  });

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
};

interface CustomizeNotificationEmailTabProps {
  /** Additional className */
  className?: string;
  /** Cancel button handler */
  onCancel?: () => void;
  /** Save button handler */
  onSave?: (subject: string, editorState: SerializedEditorState | undefined) => void;
}

/**
 * CustomizeNotificationEmailTab Molecule
 *
 * Content section for Email tab in Customize Notification Modal
 */
// Available variables list
const AVAILABLE_VARIABLES = [
  '{Customer first name}',
  '{Customer full name}',
  '{Customer email}',
  '{Customer address}',
  '{package weight}',
  '{package dimensions}',
  '{customer last name}',
];

export default function CustomizeNotificationEmailTab({
  className,
  onCancel,
  onSave,
}: CustomizeNotificationEmailTabProps): React.JSX.Element {
  const defaultEditorState = useMemo(() => createDefaultEditorState(DEFAULT_EMAIL_BODY), []);
  const [editorState, setEditorState] = useState<SerializedEditorState | undefined>(
    defaultEditorState
  );
  const [subject, setSubject] = useState<string>('');
  const insertTextRef = useRef<((text: string) => void) | null>(null);

  const handleInsertTextReady = useCallback((insertText: (text: string) => void) => {
    insertTextRef.current = insertText;
  }, []);

  const handleVariableClick = useCallback((variable: string) => {
    if (insertTextRef.current) {
      insertTextRef.current(variable);
    }
  }, []);

  const handleCancel = (): void => {
    onCancel?.();
  };

  const handleSave = (): void => {
    const payload = {
      subject,
      editorState,
    };
    console.log('Save Email Text Payload:', payload);
    onSave?.(subject, editorState);
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Typography variant="label" className="text-sm font-medium text-form-title">
            Subject
          </Typography>
          <Input
            type="text"
            placeholder="Enter email subject"
            className="w-full"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography variant="label" className="text-sm font-medium text-form-title">
            Email Body Text
          </Typography>
          <Editor
            editorSerializedState={editorState}
            onSerializedChange={(value) => setEditorState(value)}
            placeholder="Enter email body text..."
            className="w-full"
            onInsertTextReady={handleInsertTextReady}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography variant="label" className="text-sm font-medium text-form-title">
            Available Variables:
          </Typography>
          <div className="flex flex-wrap gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            {AVAILABLE_VARIABLES.map((variable) => (
              <Badge
                key={variable}
                variant="outline"
                className="cursor-pointer hover:bg-form-border-light transition-colors px-3 py-1.5 text-xs font-medium"
                onClick={() => handleVariableClick(variable)}
              >
                {variable}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-form-border-light">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleSave}>
          Save Email Text
        </Button>
      </div>
    </div>
  );
}
