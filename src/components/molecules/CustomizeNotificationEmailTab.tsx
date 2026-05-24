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
  onSave?: (
    subject: string,
    editorState: SerializedEditorState | undefined
  ) => Promise<void> | void;
  initialSubject?: string;
  initialBody?: string;
  variables?: string[];
  isLoadingTemplate?: boolean;
}

/**
 * CustomizeNotificationEmailTab Molecule
 *
 * Content section for Email tab in Customize Notification Modal
 */
const VARIABLE_GROUPS = [
  {
    title: 'Customer Information',
    variables: [
      '{{customer_first_name}}',
      '{{customer_last_name}}',
      '{{customer_full_name}}',
      '{{customer_email}}',
      '{{customer_phone}}',
      '{{customer_address}}',
    ],
  },
  {
    title: 'Shipment Information',
    variables: [
      '{{tracking_number}}',
      '{{tracking_link}}',
      '{{short_tracking_link}}',
      '{{package_weight}}',
      '{{company_name}}',
    ],
  },
];

export default function CustomizeNotificationEmailTab({
  className,
  onCancel,
  onSave,
  initialSubject,
  initialBody,
  variables,
  isLoadingTemplate = false,
}: CustomizeNotificationEmailTabProps): React.JSX.Element {
  const defaultEditorState = useMemo(
    () => createDefaultEditorState(initialBody || DEFAULT_EMAIL_BODY),
    [initialBody]
  );
  const [editorState, setEditorState] = useState<SerializedEditorState | undefined>(
    defaultEditorState
  );
  const [subject, setSubject] = useState<string>(initialSubject || '');
  const insertTextRef = useRef<((text: string) => void) | null>(null);
  const displayedVariableGroups = useMemo(() => {
    if (variables?.length) {
      return [
        {
          title: 'Available Variables',
          variables: variables.map((variable) =>
            variable.startsWith('{{') ? variable : `{{${variable.replace(/\s+/g, '_')}}}`
          ),
        },
      ];
    }
    return VARIABLE_GROUPS;
  }, [variables]);

  React.useEffect(() => {
    setSubject(initialSubject || '');
  }, [initialSubject]);

  React.useEffect(() => {
    setEditorState(createDefaultEditorState(initialBody || DEFAULT_EMAIL_BODY));
  }, [initialBody]);

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

  const handleSave = async (): Promise<void> => {
    const payload = {
      subject,
      editorState,
    };
    console.log('Save Email Text Payload:', payload);
    await onSave?.(subject, editorState);
    onCancel?.();
  };

  return (
    <div className={className ?? 'flex min-h-0 flex-1 flex-col'}>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
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
            disabled={isLoadingTemplate}
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
            sidePanel={
              <>
                <div>
                  <Typography variant="body" className="text-sm font-semibold text-gray-900">
                    Available variables
                  </Typography>
                  <Typography variant="caption" className="text-xs text-gray-500">
                    Insert variables by clicking on them
                  </Typography>
                </div>

                {displayedVariableGroups.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <Typography variant="caption" className="text-xs font-semibold text-gray-700">
                      {group.title}
                    </Typography>
                    <div className="space-y-1.5">
                      {group.variables.map((variable) => (
                        <Badge
                          key={variable}
                          variant="outline"
                          className="w-full cursor-pointer justify-start rounded-md border-[#E2E8F0] bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-[#F8FAFC]"
                          onClick={() => handleVariableClick(variable)}
                        >
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            }
          />
        </div>
      </div>
      <div className="mt-auto flex shrink-0 items-center justify-between gap-3 border-t border-form-border-light pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => {
            void handleSave();
          }}
          disabled={isLoadingTemplate}
        >
          Save Email Text
        </Button>
      </div>
    </div>
  );
}
