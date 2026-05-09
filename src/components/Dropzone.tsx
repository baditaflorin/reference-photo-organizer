import { ClipboardPaste, FolderOpen, Images, Link2, Loader2, Sparkles, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { filesFromDataTransfer, filesFromInput } from '../features/library/fileDrop';
import type { ImportProgress } from '../features/library/types';
import type { ImportSource } from '../features/workspace/types';

interface DropzoneProps {
  onFiles: (files: File[], source?: ImportSource) => Promise<void>;
  onDemo: () => Promise<void>;
  onReadClipboard: () => Promise<void>;
  onImportWorkspaceFile: (file: File) => Promise<void>;
  onImportText: (text: string) => Promise<void>;
  isImporting: boolean;
  isTagging: boolean;
  isReadingClipboard: boolean;
  progress: ImportProgress | null;
  clipEnabled: boolean;
  onClipEnabledChange: (enabled: boolean) => void;
}

type DirectoryInputProps = InputHTMLAttributes<HTMLInputElement> & {
  directory?: string;
  webkitdirectory?: string;
};

const directoryInputProps: DirectoryInputProps = {
  directory: '',
  webkitdirectory: ''
};

export function Dropzone({
  onFiles,
  onDemo,
  onReadClipboard,
  onImportWorkspaceFile,
  onImportText,
  isImporting,
  isTagging,
  isReadingClipboard,
  progress,
  clipEnabled,
  onClipEnabledChange
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  const busy = isImporting || isTagging || isReadingClipboard;

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
        void filesFromDataTransfer(event.dataTransfer).then((files) => onFiles(files, 'drop'));
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
        <button className="button-secondary" type="button" onClick={() => void onReadClipboard()}>
          <ClipboardPaste className="size-4" />
          Clipboard
        </button>
        <button className="button-secondary" type="button" onClick={() => workspaceInputRef.current?.click()}>
          <Upload className="size-4" />
          Workspace
        </button>
      </div>
      <p className="mt-2 text-xs text-graphite">
        Folder import works best in Chromium and Safari. If a browser only offers single-file selection, use
        <span className="font-medium"> Images</span> or drag and drop instead.
      </p>

      <div className="mt-4 space-y-2 rounded border border-ink/10 bg-paper p-3">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-graphite">
          Image URL or pasted workspace text
        </label>
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded border border-ink/10 bg-shell px-3 py-2 text-sm outline-none"
            value={urlValue}
            onChange={(event) => setUrlValue(event.target.value)}
            placeholder="https://example.com/reference.jpg"
            aria-label="Image URL"
          />
          <button className="button-secondary" type="button" onClick={() => void onImportText(urlValue)}>
            <Link2 className="size-4" />
            Import
          </button>
        </div>
        <p className="text-xs text-graphite">
          Paste anywhere in the app to import a screenshot, image URL, or saved workspace JSON.
        </p>
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
        onChange={(event) => void onFiles(filesFromInput(event.target.files), 'picker')}
      />
      <input
        ref={folderInputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        multiple
        {...directoryInputProps}
        onChange={(event) => void onFiles(filesFromInput(event.target.files), 'folder')}
      />
      <input
        ref={workspaceInputRef}
        className="sr-only"
        type="file"
        accept=".json,application/json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onImportWorkspaceFile(file);
          }
        }}
      />
    </section>
  );
}
