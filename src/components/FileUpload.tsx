import { useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';

export type FileRejectionReason = 'type' | 'size' | 'custom';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
  message: string;
}

export interface FileUploadLabels {
  /** Used when a file does not match `accept`. Supports `%name%`. */
  invalidType?: string;
  /** Used when a file is bigger than `maxSize`. Supports `%name%` and `%max%`. */
  tooLarge?: string;
  /** Used for extra files dropped while `multiple` is false. Supports `%name%`. */
  invalid?: string;
}

export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  /** Called with the files that failed validation. */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  accept?: string;
  /** Maximum size per file in bytes. */
  maxSize?: number;
  validateFile?: (file: File) => string | null | undefined;
  labels?: FileUploadLabels;
  /** Replaces the built-in rejection message when provided. */
  error?: ReactNode;
  multiple?: boolean;
  disabled?: boolean;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
  style?: CSSProperties;
  inputId?: string;
}

const DEFAULT_LABELS: Required<FileUploadLabels> = {
  invalidType: '%name%: file type not allowed',
  tooLarge: '%name%: file is too large (max %max%)',
  invalid: '%name%: invalid file',
};

const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * 1024;

/** Formats a byte count as `B`, `KB` or `MB` with at most one decimal. */
function formatFileSize(bytes: number): string {
  const withUnit = (value: number, unit: string) =>
    `${Number.isInteger(value) ? value : value.toFixed(1)} ${unit}`;
  if (bytes >= MEGABYTE) return withUnit(bytes / MEGABYTE, 'MB');
  if (bytes >= KILOBYTE) return withUnit(bytes / KILOBYTE, 'KB');
  return `${bytes} B`;
}

function interpolate(template: string, values: { name: string; max?: string }): string {
  let message = template.replace(/%name%/g, values.name);
  if (values.max !== undefined) message = message.replace(/%max%/g, values.max);
  return message;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

function parseAccept(accept: string | undefined): string[] {
  if (!accept) return [];
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

/** True when any accept token matches the file mime type or its extension. */
function matchesAccept(file: File, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const type = file.type.toLowerCase();
  const extension = extensionOf(file.name);
  return tokens.some((token) => {
    if (token.startsWith('.')) return extension === token;
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

export function FileUpload({
  onFiles,
  onFilesRejected,
  accept,
  maxSize,
  validateFile,
  labels,
  error,
  multiple = false,
  disabled = false,
  label = 'Drop files here or click to browse',
  hint,
  className,
  style,
  inputId,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejections, setRejections] = useState<FileRejection[]>([]);

  const messages: Required<FileUploadLabels> = { ...DEFAULT_LABELS, ...labels };
  const max = maxSize === undefined ? undefined : formatFileSize(maxSize);

  /** Single source of truth for the picker and the drop zone. */
  const partition = (files: File[]) => {
    const tokens = parseAccept(accept);
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];

    files.forEach((file, index) => {
      if (!multiple && index > 0) {
        rejected.push({
          file,
          reason: 'custom',
          message: interpolate(messages.invalid, { name: file.name }),
        });
        return;
      }
      if (!matchesAccept(file, tokens)) {
        rejected.push({
          file,
          reason: 'type',
          message: interpolate(messages.invalidType, { name: file.name }),
        });
        return;
      }
      if (maxSize !== undefined && file.size > maxSize) {
        rejected.push({
          file,
          reason: 'size',
          message: interpolate(messages.tooLarge, { name: file.name, max }),
        });
        return;
      }
      const custom = validateFile?.(file);
      if (custom) {
        rejected.push({ file, reason: 'custom', message: custom });
        return;
      }
      accepted.push(file);
    });

    return { accepted, rejected };
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const { accepted, rejected } = partition(Array.from(files));
    setRejections(rejected);
    if (accepted.length > 0) onFiles(accepted);
    if (rejected.length > 0) onFilesRejected?.(rejected);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  };

  const hasInternalError = rejections.length > 0;
  const invalid = error !== undefined && error !== null ? true : hasInternalError;

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-label={typeof label === 'string' ? label : 'Upload files'}
        className="ui-file-upload-input"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <div
        className={[
          'ui-file-upload',
          dragging ? 'is-dragging' : '',
          disabled ? 'is-disabled' : '',
          invalid ? 'is-invalid' : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className="ui-file-upload-icon" aria-hidden="true">
          ↑
        </div>
        <div className="ui-file-upload-label">{label}</div>
        {hint && <div className="ui-file-upload-hint">{hint}</div>}
        {invalid && (
          <div className="ui-file-upload-error" role="alert">
            {error ??
              rejections.map((rejection, index) => (
                <div key={`${rejection.file.name}-${index}`}>{rejection.message}</div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}

export { FileUpload as Dropzone };
