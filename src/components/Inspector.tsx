import { CheckCircle2, Clock, Image as ImageIcon, Sparkles, TriangleAlert } from 'lucide-react';
import type { ImageAsset } from '../features/library/types';
import { PaletteBar } from './PaletteBar';

interface InspectorProps {
  image: ImageAsset | null;
  total: number;
  tagged: number;
  failed: number;
  tags: Array<{ label: string; count: number }>;
  activeTag: string;
  onTagChange: (tag: string) => void;
}

export function Inspector({ image, total, tagged, failed, tags, activeTag, onTagChange }: InspectorProps) {
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
