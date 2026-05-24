import React from 'react';
import { Controller } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Plus,
  ChevronDown,
  Trash2,
  Edit2,
  Loader2,
  Search,
  Info,
  UploadCloud,
  X,
} from 'lucide-react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { buildNoteSchema } from '@/schemas/orderDetails.schema';
import { notifyApiError, notifyApiSuccess } from '@/lib/notify';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/badge';
import { Textarea } from '@/components/atoms/textarea';
import Typography from '@/components/atoms/Typography';
import { Checkbox } from '@/components/atoms/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/atoms/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  useCreateStopNoteMutation,
  useDeleteStopNoteMutation,
  useGetStopNotesQuery,
  useUpdateStopNoteMutation,
} from '@/store/api';
import type { PortalStopNoteResponse, DeliveryStopDetailPackageDto } from '@/store/api/ordersApi';
import PortalImagePreviewModal from '@/components/common/PortalImagePreviewModal';
import {
  AddNoteIllustration,
  DeleteNoteIllustration,
  EditNoteIllustration,
  NoNotesIllustration,
} from '@/assets/svg';
import {
  PORTAL_MODAL_BODY,
  PORTAL_MODAL_CANCEL_BTN,
  PORTAL_MODAL_DESCRIPTION,
  PORTAL_MODAL_DESTRUCTIVE_BTN,
  PORTAL_MODAL_FOOTER,
  PORTAL_MODAL_FOOTER_ROW,
  PORTAL_MODAL_FORM_WRAPPER,
  PORTAL_MODAL_ICON_LARGE,
  PORTAL_MODAL_ICON_SMALL,
  PORTAL_MODAL_LABEL,
  PORTAL_MODAL_TEXTAREA,
  PORTAL_MODAL_TITLE,
  PORTAL_MODAL_TITLE_SM,
  PORTAL_MODAL_WRAPPER,
} from '@/lib/modalStyles';

type PortalNoteType = 'Customer' | 'Package Issue';

const TYPE_UI_TO_API: Record<PortalNoteType, 'CUSTOMER' | 'PACKAGE_ISSUE_NOTE'> = {
  Customer: 'CUSTOMER',
  'Package Issue': 'PACKAGE_ISSUE_NOTE',
};

interface NoteView {
  id: string;
  type: PortalNoteType | 'Admin';
  content: string;
  date: string;
  author?: string;
  attachments?: string[];
  attachmentRecords?: Array<{ id: string; image_url?: string | null }>;
  packageIds?: string[];
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '';
  }
}

function mapNote(item: PortalStopNoteResponse): NoteView | null {
  const apiType = (item.note_type || '').toUpperCase();
  let type: NoteView['type'];
  if (apiType === 'CUSTOMER') type = 'Customer';
  else if (apiType === 'PACKAGE_ISSUE_NOTE') type = 'Package Issue';
  else if (apiType === 'ADMIN') type = 'Admin';
  else return null;
  const fullName = item.created_by
    ? [item.created_by.first_name, item.created_by.last_name].filter(Boolean).join(' ').trim()
    : '';
  return {
    id: item.id,
    type,
    content: item.message,
    date: formatDate(item.created_at),
    author: fullName || item.created_by?.email || undefined,
    attachments:
      item.images?.map((img) => img.image_url).filter((u): u is string => Boolean(u)) ?? [],
    attachmentRecords: item.images ?? [],
    packageIds: item.package_ids ?? [],
  };
}

interface PackageOption {
  id: string;
  label: string;
}

function PortalPackageSelect({
  options,
  selected,
  onChange,
}: {
  options: PackageOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  const labels = selected.map((id) => options.find((o) => o.id === id)?.label ?? id).join(', ');
  const toggle = (id: string): void => {
    onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-[#E4E4E7] bg-white px-3 text-sm font-medium text-gray-900 shadow-none hover:bg-[#F9FAFB]"
        >
          <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : ''}`}>
            {selected.length > 0 ? labels : 'Select package ID'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] rounded-md border border-[#E4E4E7] bg-white p-2 shadow-md"
      >
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="h-9 w-full rounded-md border border-[#E4E4E7] pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#AE2224]/30"
              placeholder="Search ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[240px] space-y-1 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <Typography className="py-4 text-center text-sm text-gray-400">
                No package IDs found.
              </Typography>
            ) : (
              filtered.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => toggle(opt.id)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selected.includes(opt.id)}
                    className="data-[state=checked]:bg-[#AE2224] data-[state=checked]:border-[#AE2224]"
                    readOnly
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface AddNoteDialogProps {
  open: boolean;
  type: PortalNoteType;
  onClose: () => void;
  onSubmit: (note: string, packageIds?: string[], images?: File[]) => Promise<void>;
  saving: boolean;
  packageOptions: PackageOption[];
}

function AddNoteDialog({
  open,
  type,
  onClose,
  onSubmit,
  saving,
  packageOptions,
}: AddNoteDialogProps): React.JSX.Element {
  const isPackageIssue = type === 'Package Issue';
  const schema = React.useMemo(() => buildNoteSchema(isPackageIssue), [isPackageIssue]);
  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useFormValidation({
    schema,
    defaultValues: { message: '', packageIds: [], newImagesCount: 0, existingImagesCount: 0 },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [attachments, setAttachments] = React.useState<{ file: File; url: string }[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const note = watch('message') ?? '';

  React.useEffect(() => {
    if (open) {
      reset({ message: '', packageIds: [], newImagesCount: 0, existingImagesCount: 0 });
      setAttachments([]);
    }
  }, [open, reset]);

  React.useEffect(() => {
    setValue('newImagesCount', attachments.length, { shouldValidate: true });
  }, [attachments.length, setValue]);

  const handleFiles = (files: FileList | null): void => {
    if (!files || files.length === 0) return;
    const accepted = Array.from(files)
      .filter((file) => file.type.startsWith('image/') && file.size > 0)
      .slice(0, 5 - attachments.length);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (accepted.length === 0) return;
    void readFilesAsDataUrls(accepted).then((items) => {
      setAttachments((prev) => [...prev, ...items]);
    });
  };
  const removeAttachment = (index: number): void => {
    setAttachments((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const submit = handleSubmit((data) => {
    void onSubmit(
      data.message,
      data.packageIds,
      attachments.map((a) => a.file)
    );
  });
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={PORTAL_MODAL_FORM_WRAPPER}>
        <div className={PORTAL_MODAL_BODY}>
          <div className="flex flex-col items-center">
            <img src={AddNoteIllustration} alt="" className={PORTAL_MODAL_ICON_SMALL} />
          </div>
          <DialogTitle className={PORTAL_MODAL_TITLE_SM}>Add {type} Note</DialogTitle>
          <form
            onSubmit={(e) => {
              void submit(e);
            }}
            className="mt-6 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                Description <span className="text-[#EF4444]">*</span>
              </Typography>
              <span className="text-xs font-medium text-gray-400">{note.length} / 500</span>
            </div>
            <Textarea
              {...register('message')}
              maxLength={500}
              placeholder={
                type === 'Customer'
                  ? 'Add client-related notes for this delivery…'
                  : 'Describe the issue with the package…'
              }
              className={PORTAL_MODAL_TEXTAREA}
            />
            {errors.message ? (
              <Typography className="text-xs text-[#EF4444]">{errors.message.message}</Typography>
            ) : null}
            {type === 'Package Issue' ? (
              <>
                <div className="mt-5 space-y-2">
                  <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                    Package ID <span className="text-[#EF4444]">*</span>
                  </Typography>
                  <Controller
                    control={control}
                    name="packageIds"
                    render={({ field }) => (
                      <PortalPackageSelect
                        options={packageOptions}
                        selected={field.value ?? []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.packageIds ? (
                    <Typography className="text-xs text-[#EF4444]">
                      {errors.packageIds.message as string}
                    </Typography>
                  ) : null}
                </div>
                <div className="mt-5 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div className="flex items-center justify-between">
                    <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                      Attachments <span className="text-[#EF4444]">*</span>
                    </Typography>
                    <span className="text-xs font-medium text-gray-400">Upload Images (Max 5)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-[#E5E5EC] bg-white p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F1FF]">
                        <UploadCloud className="h-5 w-5 text-[#3B82F6]" />
                      </div>
                      <div>
                        <Typography className="text-sm font-medium text-gray-900">
                          Upload Image
                        </Typography>
                        <Typography className="text-xs text-gray-400">
                          Max 2 MB · PNG, JPG
                        </Typography>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={attachments.length >= 5}
                      className="h-9 gap-1.5 rounded-md border-[#E4E4E7] bg-white px-3 text-sm font-medium"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 rounded-md bg-[#F0F7FF] p-3 text-[#1E40AF]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]" />
                    <span className="text-xs font-medium leading-snug">
                      Upload up to 5 images related to the issue.
                    </span>
                  </div>
                  {attachments.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {attachments.map((a, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square overflow-hidden rounded-md"
                        >
                          <img src={a.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-500 shadow hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {errors.newImagesCount ? (
                    <Typography className="text-xs text-[#EF4444]">
                      {errors.newImagesCount.message}
                    </Typography>
                  ) : null}
                </div>
              </>
            ) : null}
          </form>
        </div>
        <div className={PORTAL_MODAL_FOOTER}>
          <div className={PORTAL_MODAL_FOOTER_ROW}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving || isSubmitting}
              className={PORTAL_MODAL_CANCEL_BTN}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={saving || isSubmitting || !isValid}
              className={PORTAL_MODAL_DESTRUCTIVE_BTN}
            >
              {saving ? 'Adding…' : 'Add Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditNoteDialogProps {
  open: boolean;
  note: NoteView | null;
  onClose: () => void;
  onSubmit: (payload: {
    message: string;
    packageIds?: string[];
    newImages: File[];
    deletedImageIds: string[];
  }) => Promise<void>;
  saving: boolean;
  packageOptions: PackageOption[];
}

function EditNoteDialog({
  open,
  note,
  onClose,
  onSubmit,
  saving,
  packageOptions,
}: EditNoteDialogProps): React.JSX.Element {
  const isPackageIssue = note?.type === 'Package Issue';
  const schema = React.useMemo(() => buildNoteSchema(isPackageIssue), [isPackageIssue]);
  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useFormValidation({
    schema,
    defaultValues: {
      message: note?.content ?? '',
      packageIds: note?.packageIds ?? [],
      newImagesCount: 0,
      existingImagesCount: note?.attachmentRecords?.length ?? 0,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [existingImages, setExistingImages] = React.useState<
    Array<{ id: string; image_url?: string | null }>
  >([]);
  const [deletedImageIds, setDeletedImageIds] = React.useState<string[]>([]);
  const [newImages, setNewImages] = React.useState<{ file: File; url: string }[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const content = watch('message') ?? '';

  React.useEffect(() => {
    if (open && note) {
      reset({
        message: note.content,
        packageIds: note.packageIds ?? [],
        newImagesCount: 0,
        existingImagesCount: note.attachmentRecords?.length ?? 0,
      });
      setExistingImages(note.attachmentRecords ?? []);
      setDeletedImageIds([]);
      setNewImages([]);
      const tmr = setTimeout(() => void trigger(), 0);
      return () => clearTimeout(tmr);
    }
  }, [open, note, reset, trigger]);

  React.useEffect(() => {
    setValue('newImagesCount', newImages.length, { shouldValidate: true, shouldDirty: true });
  }, [newImages.length, setValue]);

  React.useEffect(() => {
    setValue('existingImagesCount', existingImages.length, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [existingImages.length, setValue]);

  const totalImages = existingImages.length + newImages.length;
  const isFormDirty = isDirty || newImages.length > 0 || deletedImageIds.length > 0;

  const handleFiles = (files: FileList | null): void => {
    if (!files || files.length === 0) return;
    const accepted = Array.from(files)
      .filter((file) => file.type.startsWith('image/') && file.size > 0)
      .slice(0, 5 - totalImages);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (accepted.length === 0) return;
    void readFilesAsDataUrls(accepted).then((items) => {
      setNewImages((prev) => [...prev, ...items]);
    });
  };
  const removeExisting = (id: string): void => {
    setExistingImages((prev) => prev.filter((i) => i.id !== id));
    setDeletedImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  const removeNew = (idx: number): void => {
    setNewImages((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const submit = handleSubmit((data) => {
    void onSubmit({
      message: data.message,
      packageIds: isPackageIssue ? data.packageIds : undefined,
      newImages: newImages.map((n) => n.file),
      deletedImageIds,
    });
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={PORTAL_MODAL_FORM_WRAPPER}>
        <div className={PORTAL_MODAL_BODY}>
          <div className="flex flex-col items-center">
            <img src={EditNoteIllustration} alt="" className={PORTAL_MODAL_ICON_SMALL} />
          </div>
          <DialogTitle className={PORTAL_MODAL_TITLE_SM}>Edit {note?.type ?? ''} Note</DialogTitle>
          <form
            onSubmit={(e) => {
              void submit(e);
            }}
            className="mt-6 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                Description
              </Typography>
              <span className="text-xs font-medium text-gray-400">{content.length} / 500</span>
            </div>
            <Textarea {...register('message')} maxLength={500} className={PORTAL_MODAL_TEXTAREA} />
            {errors.message ? (
              <Typography className="text-xs text-[#EF4444]">{errors.message.message}</Typography>
            ) : null}

            {isPackageIssue ? (
              <div className="mt-5 space-y-2">
                <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                  Package ID <span className="text-[#EF4444]">*</span>
                </Typography>
                <Controller
                  control={control}
                  name="packageIds"
                  render={({ field }) => (
                    <PortalPackageSelect
                      options={packageOptions}
                      selected={field.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.packageIds ? (
                  <Typography className="text-xs text-[#EF4444]">
                    {errors.packageIds.message as string}
                  </Typography>
                ) : null}
              </div>
            ) : null}

            {isPackageIssue ? (
              <div className="mt-5 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="flex items-center justify-between">
                  <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                    Attachments <span className="text-[#EF4444]">*</span>
                  </Typography>
                  <span className="text-xs font-medium text-gray-400">Upload Images (Max 5)</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-[#E5E5EC] bg-white p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F1FF]">
                      <UploadCloud className="h-5 w-5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <Typography className="text-sm font-medium text-gray-900">
                        Upload Image
                      </Typography>
                      <Typography className="text-xs text-gray-400">Max 2 MB · PNG, JPG</Typography>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={totalImages >= 5}
                    className="h-9 gap-1.5 rounded-md border-[#E4E4E7] bg-white px-3 text-sm font-medium"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload
                  </Button>
                </div>

                {existingImages.length > 0 || newImages.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Uploaded Images</span>
                      <span className="text-xs text-gray-500">{totalImages}/5</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {existingImages
                        .filter((img) => Boolean(img.image_url))
                        .map((img) => (
                          <div
                            key={img.id}
                            className="group relative aspect-square overflow-hidden rounded-md"
                          >
                            <img
                              src={img.image_url ?? ''}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeExisting(img.id)}
                              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-500 shadow hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      {newImages.map((img, idx) => (
                        <div
                          key={`new-${idx}`}
                          className="group relative aspect-square overflow-hidden rounded-md"
                        >
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNew(idx)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-500 shadow hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {errors.newImagesCount ? (
                  <Typography className="text-xs text-[#EF4444]">
                    {errors.newImagesCount.message}
                  </Typography>
                ) : null}
              </div>
            ) : null}
          </form>
        </div>
        <div className={PORTAL_MODAL_FOOTER}>
          <div className={PORTAL_MODAL_FOOTER_ROW}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving || isSubmitting}
              className={PORTAL_MODAL_CANCEL_BTN}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={saving || isSubmitting || !isValid || !isFormDirty}
              className={PORTAL_MODAL_DESTRUCTIVE_BTN}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteNoteDialogProps {
  open: boolean;
  noteType?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}

function DeleteNoteDialog({
  open,
  noteType = 'Customer',
  onClose,
  onConfirm,
  deleting,
}: DeleteNoteDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={PORTAL_MODAL_WRAPPER}>
        <div className={PORTAL_MODAL_BODY}>
          <div className="flex flex-col items-center">
            <img src={DeleteNoteIllustration} alt="" className={PORTAL_MODAL_ICON_LARGE} />
          </div>
          <DialogTitle className={PORTAL_MODAL_TITLE}>Delete {noteType} Note?</DialogTitle>
          <DialogDescription className={PORTAL_MODAL_DESCRIPTION}>
            Are you sure you want to delete this note? This action cannot be undone.
          </DialogDescription>
        </div>
        <div className={PORTAL_MODAL_FOOTER}>
          <div className={PORTAL_MODAL_FOOTER_ROW}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={deleting}
              className={PORTAL_MODAL_CANCEL_BTN}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void onConfirm()}
              disabled={deleting}
              className={PORTAL_MODAL_DESTRUCTIVE_BTN}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ALLOWED_PORTAL_TYPES: PortalNoteType[] = ['Customer', 'Package Issue'];

function readFilesAsDataUrls(files: File[]): Promise<{ file: File; url: string }[]> {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<{ file: File; url: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            resolve({ file, url: typeof result === 'string' ? result : '' });
          };
          reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
          reader.readAsDataURL(file);
        })
    )
  );
}

interface PortalDeliveryNotesCardProps {
  packages?: DeliveryStopDetailPackageDto[];
}

export default function PortalDeliveryNotesCard({
  packages = [],
}: PortalDeliveryNotesCardProps): React.JSX.Element {
  const { id: orderId, stopId } = useParams<{ id: string; stopId: string }>();
  const packageOptions: PackageOption[] = React.useMemo(
    () =>
      packages.map((p, idx) => ({
        id: p.id,
        label: `Package ${String(idx + 1).padStart(2, '0')} · ${p.package_id ?? '—'}`,
      })),
    [packages]
  );
  const packageCodeById = React.useMemo(() => {
    const map = new Map<string, string>();
    packages.forEach((p) => {
      if (p.package_id) map.set(p.id, p.package_id);
    });
    return map;
  }, [packages]);

  const { data: notesResponse, isLoading } = useGetStopNotesQuery(
    { orderId: orderId ?? '', stopId: stopId ?? '' },
    { skip: !orderId || !stopId }
  );
  const [createStopNote, { isLoading: isCreating }] = useCreateStopNoteMutation();
  const [updateStopNote, { isLoading: isUpdating }] = useUpdateStopNoteMutation();
  const [deleteStopNote, { isLoading: isDeleting }] = useDeleteStopNoteMutation();

  const notes = React.useMemo<NoteView[]>(() => {
    const items = notesResponse?.data?.items ?? [];
    return items.map(mapNote).filter((n): n is NoteView => Boolean(n));
  }, [notesResponse?.data?.items]);

  const existingTypes = React.useMemo<Set<NoteView['type']>>(
    () => new Set(notes.map((n) => n.type)),
    [notes]
  );
  const addableTypes = React.useMemo<PortalNoteType[]>(
    () => ALLOWED_PORTAL_TYPES.filter((t) => !existingTypes.has(t)),
    [existingTypes]
  );

  const [addType, setAddType] = React.useState<PortalNoteType | null>(null);
  const [noteToEdit, setNoteToEdit] = React.useState<NoteView | null>(null);
  const [noteToDelete, setNoteToDelete] = React.useState<NoteView | null>(null);
  const [preview, setPreview] = React.useState<{ images: string[]; index: number } | null>(null);
  const openPreview = (images: string[], index = 0): void => {
    setPreview({ images, index });
  };

  const handleAdd = async (
    content: string,
    packageIds?: string[],
    images?: File[]
  ): Promise<void> => {
    if (!orderId || !stopId || !addType) return;
    try {
      const payload: Record<string, unknown> = {
        note_type: TYPE_UI_TO_API[addType],
        message: content,
      };
      if (addType === 'Package Issue' && packageIds?.length) {
        payload.package_ids = packageIds;
      }
      const result = await createStopNote({ orderId, stopId, payload, images }).unwrap();
      notifyApiSuccess(result, { message: 'Note added' });
      setAddType(null);
    } catch (err) {
      notifyApiError(err);
    }
  };

  const handleEdit = async (payload: {
    message: string;
    packageIds?: string[];
    newImages: File[];
    deletedImageIds: string[];
  }): Promise<void> => {
    if (!orderId || !stopId || !noteToEdit) return;
    try {
      const apiPayload: Record<string, unknown> = { message: payload.message };
      if (payload.packageIds !== undefined) apiPayload.package_ids = payload.packageIds;
      const result = await updateStopNote({
        orderId,
        stopId,
        noteId: noteToEdit.id,
        payload: apiPayload,
        images: payload.newImages.length > 0 ? payload.newImages : undefined,
        deletedImageIds: payload.deletedImageIds.length > 0 ? payload.deletedImageIds : undefined,
      }).unwrap();
      notifyApiSuccess(result, { message: 'Note updated' });
      setNoteToEdit(null);
    } catch (err) {
      notifyApiError(err);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!orderId || !stopId || !noteToDelete) return;
    try {
      const result = await deleteStopNote({
        orderId,
        stopId,
        noteId: noteToDelete.id,
      }).unwrap();
      notifyApiSuccess(result, { message: 'Note deleted' });
      setNoteToDelete(null);
    } catch (err) {
      notifyApiError(err);
    }
  };

  const canEditNote = (note: NoteView): boolean => note.type !== 'Admin';

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#FBFBFC] px-4 py-2">
        <Typography
          variant="label"
          className="text-[13px] font-medium uppercase tracking-tight text-gray-700"
        >
          Delivery Notes
        </Typography>
        {addableTypes.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-[13px] font-medium text-gray-800 hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add a Note
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 space-y-1 rounded-lg border border-[#E5E7EB] bg-white p-1.5 shadow-lg"
            >
              {addableTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setAddType(type)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md p-2 hover:bg-[#F9FAFB]"
                >
                  <Plus className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[13px] font-medium text-gray-700">Add {type} Note</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div className="space-y-3 px-5 py-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : null}

        {!isLoading && notes.length === 0 ? (
          <div className="m-2 flex h-64 flex-col items-center justify-center rounded-[16px] border border-dashed border-[#E5E5EC] bg-white p-8">
            <img src={NoNotesIllustration} alt="" className="mb-4 h-24 w-24" />
            <Typography className="text-[16px] font-medium text-gray-900">
              No notes added yet.
            </Typography>
          </div>
        ) : null}

        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              'group relative rounded-[10px] border border-transparent p-4 transition-all',
              note.type === 'Customer' && 'bg-[#F1F5F9]',
              note.type === 'Package Issue' && 'bg-[#FEF2F2]',
              note.type === 'Admin' && 'bg-[#EFF6FF]'
            )}
          >
            <div className="space-y-4">
              <Badge
                variant="outline"
                className={cn(
                  'flex w-fit items-center gap-1.5 rounded-full border-none px-3 py-1 text-[10px] font-semibold shadow-none',
                  note.type === 'Customer' && 'bg-white text-gray-900',
                  note.type === 'Package Issue' && 'bg-[#FEE2E2] text-[#B91C1C]',
                  note.type === 'Admin' && 'bg-[#DBEAFE] text-[#1E40AF]'
                )}
              >
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    note.type === 'Customer' && 'bg-slate-600',
                    note.type === 'Package Issue' && 'bg-red-500',
                    note.type === 'Admin' && 'bg-blue-500'
                  )}
                />
                {note.type} Note
              </Badge>
              {note.type === 'Package Issue' && note.packageIds?.length ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
                  <span className="font-semibold text-[#B91C1C]">PACKAGE IDS:</span>
                  {note.packageIds.map((pid) => {
                    const code = packageCodeById.get(pid);
                    if (!code) return null;
                    return (
                      <span key={pid} className="font-semibold text-[#B91C1C]">
                        #{code}
                      </span>
                    );
                  })}
                </div>
              ) : null}
              <Typography className="py-1 text-[13px] font-medium leading-normal text-gray-800">
                {note.content}
              </Typography>
              {note.type === 'Package Issue' && note.attachments?.length ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#B91C1C]">
                      Attached Images
                    </span>
                    <button
                      type="button"
                      onClick={() => openPreview(note.attachments ?? [], 0)}
                      className="text-[12px] text-gray-500 underline underline-offset-2 hover:text-gray-900"
                    >
                      Show Images
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {note.attachments.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => openPreview(note.attachments ?? [], i)}
                        className="h-20 w-20 cursor-pointer overflow-hidden rounded-md border border-white p-0 shadow-sm transition-transform hover:scale-105"
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-gray-300 pt-3">
                <Typography className="text-[12px] font-medium text-gray-500">
                  {note.author ? `Added by: ${note.author} • ` : ''}
                  {note.date}
                </Typography>
                {canEditNote(note) ? (
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNoteToDelete(note)}
                      className="h-7 gap-1 rounded-md border-red-200 bg-white px-2.5 text-[12px] font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNoteToEdit(note)}
                      className="h-7 gap-1 rounded-md border-gray-200 bg-white px-2.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddNoteDialog
        open={addType !== null}
        type={addType ?? 'Customer'}
        onClose={() => setAddType(null)}
        onSubmit={handleAdd}
        saving={isCreating}
        packageOptions={packageOptions}
      />

      <EditNoteDialog
        open={noteToEdit !== null}
        note={noteToEdit}
        onClose={() => setNoteToEdit(null)}
        onSubmit={handleEdit}
        saving={isUpdating}
        packageOptions={packageOptions}
      />

      <DeleteNoteDialog
        open={noteToDelete !== null}
        noteType={noteToDelete?.type}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDelete}
        deleting={isDeleting}
      />

      <PortalImagePreviewModal
        isOpen={preview !== null}
        onClose={() => setPreview(null)}
        images={preview?.images ?? []}
        initialIndex={preview?.index ?? 0}
      />
    </div>
  );
}
