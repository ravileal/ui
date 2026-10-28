import { useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';

export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
  style?: CSSProperties;
  inputId?: string;
}

export function FileUpload({
  onFiles,
  accept,
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

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    onFiles(Array.from(files));
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
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
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
      </div>
    </>
  );
}

export { FileUpload as Dropzone };
