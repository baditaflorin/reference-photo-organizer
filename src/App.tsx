import { ExternalLink, HeartHandshake, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { Inspector } from './components/Inspector';
import { MoodBoard } from './components/MoodBoard';
import { Toolbar } from './components/Toolbar';
import { downloadBlob, safeFileName } from './features/export/download';
import { createMoodBoardPng } from './features/export/moodBoardPng';
import { createReferencePdf } from './features/export/referencePdf';
import { collectTags, filterImages } from './features/library/filtering';
import type { BoardFilters } from './features/library/types';
import { useImageLibrary } from './features/library/useImageLibrary';

declare const __APP_VERSION__: string;
declare const __COMMIT_SHA__: string;
declare const __REPOSITORY_URL__: string;
declare const __PAYPAL_URL__: string;

export default function App() {
  const {
    images,
    isImporting,
    isTagging,
    clipEnabled,
    setClipEnabled,
    progress,
    notice,
    setNotice,
    status,
    importFiles,
    loadDemo,
    retagWithClip,
    clearImages,
    removeImage
  } = useImageLibrary();
  const [filters, setFilters] = useState<BoardFilters>({ search: '', tag: '', layout: 'masonry' });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState('Artist reference board');
  const [isExporting, setIsExporting] = useState(false);

  const tags = useMemo(() => collectTags(images), [images]);
  const filteredImages = useMemo(() => filterImages(images, filters), [images, filters]);
  const activeImage = useMemo(
    () => images.find((image) => image.id === activeId) ?? filteredImages[0] ?? images[0] ?? null,
    [activeId, filteredImages, images]
  );
  const versionLine = useMemo(() => `v${__APP_VERSION__} / ${__COMMIT_SHA__}`, []);

  const exportTargets = filteredImages.length > 0 ? filteredImages : images;

  async function handleExportPng() {
    if (exportTargets.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      const blob = await createMoodBoardPng(exportTargets, { title: boardTitle, showLabels: true });
      downloadBlob(blob, `${safeFileName(boardTitle || 'mood-board')}.png`);
      setNotice('PNG mood-board exported.');
    } catch {
      setNotice('PNG export failed.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportPdf() {
    if (exportTargets.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      const blob = await createReferencePdf(exportTargets, { title: boardTitle, showLabels: true });
      downloadBlob(blob, `${safeFileName(boardTitle || 'reference-sheet')}.pdf`);
      setNotice('PDF reference sheet exported.');
    } catch {
      setNotice('PDF export failed.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-3 py-3 sm:px-5 lg:px-7">
        <header className="app-header">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-clay">Reference Photo Organizer</p>
            <h1 className="truncate text-2xl font-semibold sm:text-3xl">Artist reference workspace</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium" aria-label="Project links">
            <a className="link-button" href={__REPOSITORY_URL__} target="_blank" rel="noreferrer">
              <Star className="size-4" />
              Star repo
              <ExternalLink className="size-3.5" />
            </a>
            <a className="link-button" href={__PAYPAL_URL__} target="_blank" rel="noreferrer">
              <HeartHandshake className="size-4" />
              PayPal
              <ExternalLink className="size-3.5" />
            </a>
            <span className="version-pill">{versionLine}</span>
          </nav>
        </header>

        <div className="grid flex-1 gap-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <Dropzone
              onFiles={importFiles}
              onDemo={loadDemo}
              isImporting={isImporting}
              isTagging={isTagging}
              progress={progress}
              clipEnabled={clipEnabled}
              onClipEnabledChange={setClipEnabled}
            />
          </div>

          <section className="min-w-0 space-y-4">
            <Toolbar
              search={filters.search}
              onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
              layout={filters.layout}
              onLayoutChange={(layout) => setFilters((current) => ({ ...current, layout }))}
              title={boardTitle}
              onTitleChange={setBoardTitle}
              canExport={exportTargets.length > 0}
              isExporting={isExporting}
              onExportPng={() => void handleExportPng()}
              onExportPdf={() => void handleExportPdf()}
              onRetag={() => void retagWithClip()}
              onClear={() => void clearImages()}
            />
            <MoodBoard
              images={filteredImages}
              layout={filters.layout}
              activeId={activeImage?.id ?? null}
              onActiveChange={setActiveId}
              onRemove={(id) => void removeImage(id)}
            />
          </section>

          <Inspector
            image={activeImage}
            total={status.total}
            tagged={status.tagged}
            failed={status.failed}
            tags={tags}
            activeTag={filters.tag}
            onTagChange={(tag) => setFilters((current) => ({ ...current, tag }))}
          />
        </div>

        {notice ? (
          <div className="toast" role="status" aria-live="polite">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
