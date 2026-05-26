import { useEffect, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { SETTINGS_LOGO_UPLOAD_CLASS } from '@/lib/settingsUi';

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
  remoteLogoUrl?: string | null;
  onClearRemoteLogo?: () => void;
  readOnly?: boolean;
}

export default function LogoUploadSection({
  uploadedLogoFile,
  setUploadedLogoFile,
  logoInputRef,
  remoteLogoUrl = null,
  onClearRemoteLogo,
  readOnly = false,
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
    <section className={SETTINGS_LOGO_UPLOAD_CLASS}>
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleLogoChange}
      />

      {uploadedLogoFile ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {imagePreviewUrl && uploadedLogoFile.type.startsWith('image/') ? (
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="size-10 shrink-0 rounded-lg object-cover"
                width={40}
                height={40}
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white">
                <Upload className="size-5 text-[#A1A1AA]" aria-hidden />
              </div>
            )}
            <div className="min-w-0">
              <Typography variant="body" className="text-sm font-medium text-[#18181B]">
                {uploadedLogoFile.name}
              </Typography>
              <Typography variant="caption" className="text-xs text-[#71717A]">
                {readableFileSize(uploadedLogoFile.size)}
              </Typography>
            </div>
          </div>
          {!readOnly ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 border-[#E5E7EB] bg-white px-3 text-sm"
                onClick={handleLogoUploadClick}
              >
                <Upload className="mr-1 size-4" />
                Replace
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-[#A1A1AA] hover:text-[#DC2626]"
                onClick={handleRemove}
                aria-label="Remove file"
              >
                <Trash2 className="size-5" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : remoteLogoUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={remoteLogoUrl}
              alt="Company logo"
              className="size-10 shrink-0 rounded-lg object-cover"
              width={40}
              height={40}
            />
            <div className="min-w-0">
              <Typography variant="body" className="truncate text-sm font-medium text-[#18181B]">
                {remoteFilename}
              </Typography>
              <Typography variant="caption" className="text-xs text-[#71717A]">
                Current logo on file
              </Typography>
            </div>
          </div>
          {!readOnly ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 border-[#E5E7EB] bg-white px-3 text-sm"
                onClick={handleLogoUploadClick}
              >
                <Upload className="mr-1 size-4" />
                Replace
              </Button>
              {onClearRemoteLogo ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-9 border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]"
                  onClick={onClearRemoteLogo}
                  aria-label="Remove logo"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="relative flex size-10 items-center justify-center rounded-full bg-white text-[#71717A] shadow-sm">
              <Upload className="size-4" />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#C63131] text-white">
                <Upload className="size-2.5" />
              </span>
            </div>
            <div>
              <Typography variant="body" className="text-sm font-medium text-[#18181B]">
                Upload Company Logo
              </Typography>
              <Typography variant="caption" className="text-xs text-[#71717A]">
                Max 2 MB file size — PNG or JPEG
              </Typography>
            </div>
          </div>
          {!readOnly ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1.5 border-[#E5E7EB] bg-white px-3 text-sm"
              onClick={handleLogoUploadClick}
            >
              <Upload className="size-4" />
              Upload
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
