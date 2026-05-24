import { useEffect, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { Card, CardContent } from '@/components/molecules/card';

function useBase64Preview(file: File | null): string | null {
  const [base64, setBase64] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      queueMicrotask(() => {
        setBase64(null);
      });
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setBase64(reader.result as string);
    };

    reader.readAsDataURL(file);

    return () => {
      reader.abort();
    };
  }, [file]);

  return base64;
}

interface LogoUploadSectionProps {
  uploadedLogoFile: File | null;
  setUploadedLogoFile: (file: File | null) => void;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  /** Current logo from server when user has not chosen a new file */
  remoteLogoUrl?: string | null;
  /** Clear the in-session preview of the remote logo; parent marks pending removal until save. */
  onClearRemoteLogo?: () => void;
}

export default function LogoUploadSection({
  uploadedLogoFile,
  setUploadedLogoFile,
  logoInputRef,
  remoteLogoUrl = null,
  onClearRemoteLogo,
}: LogoUploadSectionProps): React.JSX.Element {
  const imagePreviewUrl = useBase64Preview(uploadedLogoFile);

  const handleLogoUploadClick = (): void => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const acceptedTypes = ['image/png', 'image/jpeg'];
    const maxSizeInBytes = 2 * 1024 * 1024;

    if (!acceptedTypes.includes(file.type)) {
      event.target.value = '';
      toast.error('Logo must be a JPEG or PNG file.');
      return;
    }
    if (file.size > maxSizeInBytes) {
      event.target.value = '';
      toast.error('Logo must be 2 MB or smaller.');
      return;
    }

    setUploadedLogoFile(file);
    event.target.value = '';
  };

  const handleRemove = (): void => {
    setUploadedLogoFile(null);
  };

  const remoteFilename =
    remoteLogoUrl != null && remoteLogoUrl.length > 0
      ? (() => {
          try {
            const base = remoteLogoUrl.split('?')[0] ?? '';
            const seg = base.split('/').pop();
            return seg && seg.length > 0 ? decodeURIComponent(seg) : 'Company logo';
          } catch {
            return 'Company logo';
          }
        })()
      : 'Company logo';

  const readableFileSize = (size: number): string => {
    if (size >= 1024 * 1024) {
      return `${Math.round((size / (1024 * 1024)) * 10) / 10} MB`;
    }
    if (size >= 1024) {
      return `${Math.round((size / 1024) * 10) / 10} KB`;
    }
    return `${size} B`;
  };

  return (
    <Card className="max-w-full p-2">
      <CardContent className="space-y-8">
        <section className="rounded-lg bg-white">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleLogoChange}
          />

          {uploadedLogoFile ? (
            <div className="flex items-center justify-between gap-3 rounded border border-gray-100 bg-gray-50 p-3 pl-4">
              <div className="flex items-center gap-3">
                {imagePreviewUrl && uploadedLogoFile?.type.startsWith('image/') ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="h-9 w-9 shrink-0 rounded object-cover"
                    width={36}
                    height={36}
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100">
                    <Upload className="h-6 w-6 text-gray-400" aria-hidden />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-800">{uploadedLogoFile.name}</span>
                  <span className="text-[11px] text-gray-500">
                    {readableFileSize(uploadedLogoFile.size)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 w-auto px-3 py-1.5 text-xs"
                  onClick={handleLogoUploadClick}
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  Replace
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="ml-2 text-gray-400 hover:text-red-500"
                  onClick={handleRemove}
                  aria-label="Remove file"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : remoteLogoUrl ? (
            <div className="flex items-center justify-between gap-3 rounded border border-gray-100 bg-gray-50 p-3 pl-4">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={remoteLogoUrl}
                  alt="Company logo"
                  className="h-9 w-9 shrink-0 rounded object-cover"
                  width={36}
                  height={36}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-medium text-gray-800">
                    {remoteFilename}
                  </span>
                  <Typography variant="caption" color="muted" className="text-[11px]">
                    Current logo on file — upload to replace
                  </Typography>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 w-auto px-3 py-1.5 text-xs"
                  onClick={handleLogoUploadClick}
                >
                  <Upload className="mr-1 h-3.5 w-3.5" />
                  Replace
                </Button>
                {onClearRemoteLogo ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={onClearRemoteLogo}
                    aria-label="Remove logo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-b from-gray-100 to-white text-gray-500">
                  <Upload className="h-4 w-4" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                    <Upload className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div>
                  <Typography variant="body" weight="medium" className="text-base text-gray-900">
                    Upload Company Logo
                  </Typography>
                  <Typography variant="caption" color="muted" className="text-xs">
                    Max 2 MB file size — PNG or JPEG (API limit)
                  </Typography>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleLogoUploadClick}
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
