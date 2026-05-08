import { FolderOpen, Images, Loader2, Sparkles } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { filesFromDataTransfer, filesFromInput } from '../features/library/fileDrop';
import type { ImportProgress } from '../features/library/types';

interface DropzoneProps {
  onFiles: (files: File[]) => Promise<void>;
  onDemo: () => Promise<void>;
  isImporting: boolean;
  isTagging: boolean;
  progress: ImportProgress | null;
  clipEnabled: boolean;
  onClipEnabledChange: (enabled: boolean) => void;
}

export function Dropzone({
  onFiles,
  onDemo,
  isImporting,
  isTagging,
  progress,
  clipEnabled,
  onClipEnabledChange
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const busy = isImporting || isTagging;

  return (
    <section
      className={`tool-panel ${isDragging ? 'border-saffron bg-shell' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void filesFromDataTransfer(event.dataTransfer).then(onFiles);
      }}
      aria-label="Image import"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded bg-ink text-paper">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Images className="size-5" />}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Drop image folder</h2>
          <p className="mt-1 text-sm text-graphite">Local files stay in this browser.</p>
        </div>
      </div>

      {progress ? (
        <div className="mt-4" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-xs font-semibold text-graphite">
            <span>{progress.current ?? 'Importing'}</span>
            <span>
              {progress.processed}/{progress.total}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded bg-ink/10">
            <div
              className="h-full bg-saffron"
              style={{ width: `${Math.round((progress.processed / Math.max(1, progress.total)) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button className="button-primary" type="button" onClick={() => folderInputRef.current?.click()}>
          <FolderOpen className="size-4" />
          Folder
        </button>
        <button className="button-secondary" type="button" onClick={() => inputRef.current?.click()}>
          <Images className="size-4" />
          Images
        </button>
        <button className="button-secondary col-span-2" type="button" onClick={() => void onDemo()}>
          <Sparkles className="size-4" />
          Demo board
        </button>
      </div>

      <label className="mt-4 flex items-center justify-between gap-3 rounded border border-ink/10 bg-paper px-3 py-2 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Sparkles className="size-4" />
          CLIP auto-tags
        </span>
        <input
          className="toggle"
          type="checkbox"
          checked={clipEnabled}
          onChange={(event) => onClipEnabledChange(event.target.checked)}
        />
      </label>

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => void onFiles(filesFromInput(event.target.files))}
      />
      <input
        ref={folderInputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        multiple
        {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(event) => void onFiles(filesFromInput(event.target.files))}
      />
    </section>
  );
}
