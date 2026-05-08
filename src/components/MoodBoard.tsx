import { Trash2 } from 'lucide-react';
import { sortImagesForLayout } from '../features/library/filtering';
import type { BoardLayout, ImageAsset } from '../features/library/types';
import { PaletteBar } from './PaletteBar';

interface MoodBoardProps {
  images: ImageAsset[];
  layout: BoardLayout;
  activeId: string | null;
  onActiveChange: (id: string) => void;
  onRemove: (id: string) => void;
}

export function MoodBoard({ images, layout, activeId, onActiveChange, onRemove }: MoodBoardProps) {
  const sorted = sortImagesForLayout(images, layout);

  if (sorted.length === 0) {
    return (
      <section className="empty-board" aria-label="Mood board">
        <div>
          <h2 className="text-xl font-semibold">No references match</h2>
          <p className="mt-2 text-sm text-graphite">Clear the search or load another folder.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`mood-board mood-board-${layout}`} aria-label="Mood board">
      {sorted.map((image) => (
        <article
          key={image.id}
          className={`image-card ${activeId === image.id ? 'active' : ''}`}
          onClick={() => onActiveChange(image.id)}
        >
          <button
            className="remove-button"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(image.id);
            }}
            title="Remove image"
            aria-label={`Remove ${image.name}`}
          >
            <Trash2 className="size-4" />
          </button>
          <img
            src={image.url}
            alt={image.name}
            loading="lazy"
            style={{ aspectRatio: `${image.width} / ${image.height}` }}
          />
          <PaletteBar palette={image.palette} compact />
          <div className="space-y-2 p-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{image.name}</h3>
              <p className="truncate text-xs text-graphite">{image.path}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {image.tags.slice(0, 5).map((tag) => (
                <span key={`${image.id}-${tag.label}`} className={`tag tag-${tag.source}`}>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
