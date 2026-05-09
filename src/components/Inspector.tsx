import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  TriangleAlert
} from 'lucide-react';
import type { ImageAsset } from '../features/library/types';
import { importReportSummary } from '../features/workspace/reporting';
import type { ImportReport, WorkspaceSettings } from '../features/workspace/types';
import { PaletteBar } from './PaletteBar';

interface InspectorProps {
  image: ImageAsset | null;
  total: number;
  tagged: number;
  failed: number;
  tags: Array<{ label: string; count: number }>;
  activeTag: string;
  onTagChange: (tag: string) => void;
  report: ImportReport | null;
  settings: WorkspaceSettings;
  onSettingsChange: (patch: Partial<WorkspaceSettings>) => void;
  onExportWorkspace: () => void;
  onCopySummary: () => void;
  onFactoryReset: () => void;
}

export function Inspector({
  image,
  total,
  tagged,
  failed,
  tags,
  activeTag,
  onTagChange,
  report,
  settings,
  onSettingsChange,
  onExportWorkspace,
  onCopySummary,
  onFactoryReset
}: InspectorProps) {
  return (
    <aside className="space-y-4">
      <section className="tool-panel">
        <h2 className="text-base font-semibold">Library</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Metric label="Images" value={total} icon={ImageIcon} />
          <Metric label="CLIP" value={tagged} icon={Sparkles} />
          <Metric label="Issues" value={failed} icon={failed > 0 ? TriangleAlert : CheckCircle2} />
        </div>
      </section>

      <section className="tool-panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Tags</h2>
          {activeTag ? (
            <button
              className="text-xs font-semibold text-clay underline"
              type="button"
              onClick={() => onTagChange('')}
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-auto pr-1">
          {tags.length === 0 ? (
            <span className="text-sm text-graphite">No tags yet</span>
          ) : (
            tags.map((tag) => (
              <button
                key={tag.label}
                className={`tag-filter ${activeTag === tag.label ? 'active' : ''}`}
                type="button"
                onClick={() => onTagChange(activeTag === tag.label ? '' : tag.label)}
              >
                {tag.label}
                <span>{tag.count}</span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="tool-panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Workspace</h2>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <button className="button-secondary w-full justify-start" type="button" onClick={onExportWorkspace}>
            <Download className="size-4" />
            Save workspace
          </button>
          <button className="button-secondary w-full justify-start" type="button" onClick={onCopySummary}>
            <Copy className="size-4" />
            Copy summary
          </button>
        </div>
      </section>

      <section className="tool-panel">
        <h2 className="text-base font-semibold">Settings</h2>
        <div className="mt-3 space-y-3 text-sm">
          <ToggleRow
            label="Restore last workspace"
            checked={settings.autoRestore}
            onChange={(checked) => onSettingsChange({ autoRestore: checked })}
          />
          <ToggleRow
            label="CLIP auto-tags on import"
            checked={settings.clipEnabled}
            onChange={(checked) => onSettingsChange({ clipEnabled: checked })}
          />
          <ToggleRow
            label="Include labels in export"
            checked={settings.exportIncludeLabels}
            onChange={(checked) => onSettingsChange({ exportIncludeLabels: checked })}
          />
        </div>
      </section>

      <section className="tool-panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Import report</h2>
          {report ? <span className="text-xs font-semibold text-graphite">{report.source}</span> : null}
        </div>
        {report ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-graphite">{importReportSummary(report)}</p>
            <div className="max-h-48 space-y-2 overflow-auto pr-1">
              {report.issues.length === 0 ? (
                <p className="text-sm text-graphite">No issues in the latest import.</p>
              ) : (
                report.issues.slice(0, 8).map((issue) => (
                  <div key={issue.id} className="rounded border border-ink/10 bg-paper p-2">
                    <div className="text-xs font-semibold uppercase text-graphite">{issue.name}</div>
                    <p className="mt-1 text-sm">{issue.message}</p>
                    <p className="mt-1 text-xs text-graphite">{issue.nextStep}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-graphite">
            Import a folder, clipboard image, URL, or workspace file to see the latest result.
          </p>
        )}
      </section>

      <section className="tool-panel">
        <h2 className="text-base font-semibold">Selection</h2>
        {image ? (
          <div className="mt-3 space-y-3">
            <img className="aspect-video w-full rounded object-cover" src={image.url} alt={image.name} />
            <div>
              <h3 className="truncate font-semibold">{image.name}</h3>
              <p className="mt-1 text-xs text-graphite">
                {image.width} x {image.height}px
              </p>
            </div>
            <PaletteBar palette={image.palette} />
            <div className="flex flex-wrap gap-1.5">
              {image.tags.map((tag) => (
                <span key={`${image.id}-${tag.label}-${tag.source}`} className={`tag tag-${tag.source}`}>
                  {tag.label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-graphite">
              <Clock className="size-3.5" />
              {new Date(image.importedAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-graphite">Select an image from the board.</p>
        )}
      </section>

      <section className="tool-panel">
        <button className="button-secondary w-full justify-start" type="button" onClick={onFactoryReset}>
          <RotateCcw className="size-4" />
          Factory reset local workspace
        </button>
      </section>
    </aside>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof ImageIcon }) {
  return (
    <div className="rounded border border-ink/10 bg-paper p-2">
      <Icon className="mx-auto size-4 text-moss" />
      <div className="mt-1 text-lg font-bold">{value}</div>
      <div className="text-[11px] font-semibold uppercase text-graphite">{label}</div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded border border-ink/10 bg-paper px-3 py-2">
      <span className="font-medium">{label}</span>
      <input
        className="toggle"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
