import {
  Download,
  FileText,
  Grid2X2,
  LayoutGrid,
  Search,
  Shuffle,
  Tag,
  Trash2,
  WandSparkles
} from 'lucide-react';
import type { BoardLayout } from '../features/library/types';

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  layout: BoardLayout;
  onLayoutChange: (layout: BoardLayout) => void;
  title: string;
  onTitleChange: (title: string) => void;
  canExport: boolean;
  isExporting: boolean;
  onExportPng: () => void;
  onExportPdf: () => void;
  onRetag: () => void;
  onClear: () => void;
}

const layouts: Array<{ value: BoardLayout; label: string; icon: typeof LayoutGrid }> = [
  { value: 'masonry', label: 'Masonry', icon: LayoutGrid },
  { value: 'spectrum', label: 'Spectrum', icon: Shuffle },
  { value: 'contact', label: 'Sheet', icon: Grid2X2 }
];

export function Toolbar({
  search,
  onSearchChange,
  layout,
  onLayoutChange,
  title,
  onTitleChange,
  canExport,
  isExporting,
  onExportPng,
  onExportPdf,
  onRetag,
  onClear
}: ToolbarProps) {
  return (
    <section className="toolbar" aria-label="Board controls">
      <label className="input-shell min-w-0 flex-1">
        <Search className="size-4 shrink-0 text-graphite" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tags, names, paths"
          aria-label="Search"
        />
      </label>

      <label className="input-shell min-w-[180px]">
        <Tag className="size-4 shrink-0 text-graphite" />
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Board title"
          aria-label="Board title"
        />
      </label>

      <div className="segmented" role="group" aria-label="Layout">
        {layouts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              className={layout === item.value ? 'active' : ''}
              type="button"
              onClick={() => onLayoutChange(item.value)}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>

      <button
        className="icon-button"
        type="button"
        onClick={onRetag}
        title="Run CLIP tags"
        aria-label="Run CLIP tags"
      >
        <WandSparkles className="size-4" />
      </button>
      <button
        className="icon-button"
        type="button"
        onClick={onClear}
        title="Clear library"
        aria-label="Clear library"
      >
        <Trash2 className="size-4" />
      </button>
      <button
        className="button-secondary"
        type="button"
        disabled={!canExport || isExporting}
        onClick={onExportPng}
      >
        <Download className="size-4" />
        PNG
      </button>
      <button
        className="button-primary"
        type="button"
        disabled={!canExport || isExporting}
        onClick={onExportPdf}
      >
        <FileText className="size-4" />
        PDF
      </button>
    </section>
  );
}
