import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

const LOGO_ACCEPT = 'image/jpeg,image/png,image/jpg';

export interface CompanyLogoUploadProps {
  accept?: string;
  className?: string;
}

/**
 * Company logo upload: preview/placeholder, upload button, remove, and hint text.
 * Manages its own file/preview state; parent can control via key if needed.
 */
export default function CompanyLogoUpload({
  accept = LOGO_ACCEPT,
  className,
}: CompanyLogoUploadProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) return;
    const reader = new FileReader();
    reader.onload = (): void => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') setLogoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
    setLogoFile(file);
    e.target.value = '';
  };

  const handleRemove = (): void => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        aria-label="Upload company logo"
        onChange={handleChange}
      />
      <div className="relative h-28 w-28 shrink-0">
        <button
          type="button"
          onClick={handleUploadClick}
          className={cn(
            'flex h-full w-full items-center justify-center overflow-hidden rounded-lg border-2 border-solid border-gray-800 bg-gray-50 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            !logoPreview && 'cursor-pointer'
          )}
          aria-label="Logo preview or placeholder"
        >
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Company logo"
              className="block h-full w-full object-contain"
            />
          ) : (
            <Typography color="muted" weight="bold" className="px-2 text-center">
              Your <br /> logo
            </Typography>
          )}
        </button>
        {logoPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            aria-label="Remove logo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-1.5"
          onClick={handleUploadClick}
        >
          <Upload className="h-4 w-4" />
          Upload Logo
        </Button>
        {logoFile && (
          <Typography variant="caption" color="muted" className="text-sm">
            {logoFile.name}
          </Typography>
        )}
        <Typography variant="caption" color="muted" className="text-sm">
          At least 800 x 800px recommended.
          <br /> JPG or PNG is allowed.
        </Typography>
        {logoPreview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit text-gray-600"
            onClick={handleRemove}
          >
            Remove logo
          </Button>
        )}
      </div>
    </div>
  );
}
