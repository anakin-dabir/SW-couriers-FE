import * as React from 'react';
import { useState, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/badge';
import { Typography } from '@/components/atoms';
import { SimpleEditor } from '@/components/blocks/editor-00/simple-editor';
import type { SerializedEditorState } from 'lexical';

const DEFAULT_SMS_TEXT = `Dear {customer full name}, your order {order ID} is out for delivery.
📦 Address: {delivery address}
Weight: {package weight}
ETA: {delivery date}

— SW Carriers`;

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

interface CustomizeNotificationTextTabProps {
  /** Additional className */
  className?: string;
  /** Cancel button handler */
  onCancel?: () => void;
  /** Save button handler */
  onSave?: (editorState: SerializedEditorState | undefined) => Promise<void> | void;
  initialBody?: string;
  variables?: string[];
  isLoadingTemplate?: boolean;
  isSavingTemplate?: boolean;
}

/**
 * CustomizeNotificationTextTab Molecule
 *
 * Content section for Text tab in Customize Notification Modal
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

export default function CustomizeNotificationTextTab({
  className,
  onCancel,
  onSave,
  initialBody,
  variables,
  isLoadingTemplate = false,
  isSavingTemplate = false,
}: CustomizeNotificationTextTabProps): React.JSX.Element {
  const defaultEditorState = useMemo(
    () => createDefaultEditorState(initialBody || DEFAULT_SMS_TEXT),
    [initialBody]
  );
  const [editorState, setEditorState] = useState<SerializedEditorState | undefined>(
    defaultEditorState
  );
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
    setEditorState(createDefaultEditorState(initialBody || DEFAULT_SMS_TEXT));
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
    const payload = { editorState };
    console.log('Save SMS Text Payload:', payload);
    await onSave?.(editorState);
    onCancel?.();
  };

  return (
    <div className={className ?? 'flex min-h-0 flex-1 flex-col'}>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <Typography variant="label" className="shrink-0 text-sm font-medium text-form-title">
          SMS Text
        </Typography>
        <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3 md:flex-row">
          <div className="flex min-h-0 w-full shrink-0 flex-col space-y-3 overflow-y-auto rounded-md border border-[#E5E7EB] bg-white p-3 md:h-full md:w-[220px]">
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
          </div>

          <SimpleEditor
            fillHeight
            editorSerializedState={editorState}
            onSerializedChange={(value) => setEditorState(value)}
            placeholder="Enter SMS text..."
            className="flex min-h-0 flex-1 flex-col"
            onInsertTextReady={handleInsertTextReady}
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
          disabled={isLoadingTemplate || isSavingTemplate}
        >
          {isSavingTemplate ? 'Saving...' : 'Save SMS Text'}
        </Button>
      </div>
    </div>
  );
}
