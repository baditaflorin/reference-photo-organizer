import { ExternalLink, HeartHandshake, Star, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { APP_VERSION, COMMIT_SHA, PAYPAL_URL, REPOSITORY_URL } from './appMeta';
import { Dropzone } from './components/Dropzone';
import { Inspector } from './components/Inspector';
import { MoodBoard } from './components/MoodBoard';
import { Toolbar } from './components/Toolbar';
import { downloadBlob, safeFileName } from './features/export/download';
import { createMoodBoardPng } from './features/export/moodBoardPng';
import { createReferencePdf } from './features/export/referencePdf';
import { collectTags, filterImages } from './features/library/filtering';
import { useImageLibrary } from './features/library/useImageLibrary';

export default function App() {
  const {
    images,
    workspaceMeta,
    isImporting,
    isTagging,
    isReadingClipboard,
    progress,
    notice,
    setNotice,
    status,
    importFiles,
    importText,
    importWorkspaceFile,
    readClipboard,
    handlePasteEvent,
    loadDemo,
    retagWithClip,
    clearImages,
    factoryReset,
    removeImage,
    updateView,
    updateSettings,
    exportWorkspaceState,
    copyWorkspaceSummary
  } = useImageLibrary();
  const [isExporting, setIsExporting] = useState(false);

  const tags = useMemo(() => collectTags(images), [images]);
  const filteredImages = useMemo(
    () =>
      filterImages(images, {
        search: workspaceMeta.view.searchQuery,
        tag: workspaceMeta.view.activeTag,
        layout: workspaceMeta.view.layout
      }),
    [images, workspaceMeta.view.activeTag, workspaceMeta.view.layout, workspaceMeta.view.searchQuery]
  );
  const activeImage = useMemo(
    () =>
      images.find((image) => image.id === workspaceMeta.view.activeImageId) ??
      filteredImages[0] ??
      images[0] ??
      null,
    [filteredImages, images, workspaceMeta.view.activeImageId]
  );
  const versionLine = useMemo(() => `v${APP_VERSION} / ${COMMIT_SHA}`, []);

  const exportTargets = filteredImages.length > 0 ? filteredImages : images;

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }
      void handlePasteEvent(event);
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handlePasteEvent]);

  async function handleExportPng() {
    if (exportTargets.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      const blob = await createMoodBoardPng(exportTargets, {
        title: workspaceMeta.view.boardTitle,
        showLabels: workspaceMeta.settings.exportIncludeLabels
      });
      downloadBlob(blob, `${safeFileName(workspaceMeta.view.boardTitle || 'mood-board')}.png`);
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
      const blob = await createReferencePdf(exportTargets, {
        title: workspaceMeta.view.boardTitle,
        showLabels: workspaceMeta.settings.exportIncludeLabels
      });
      downloadBlob(blob, `${safeFileName(workspaceMeta.view.boardTitle || 'reference-sheet')}.pdf`);
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
            <a className="link-button" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
              <Star className="size-4" />
              Star repo
              <ExternalLink className="size-3.5" />
            </a>
            <a className="link-button" href={PAYPAL_URL} target="_blank" rel="noreferrer">
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
              onFiles={(files, source) => importFiles(files, source)}
              onDemo={loadDemo}
              onReadClipboard={readClipboard}
              onImportWorkspaceFile={importWorkspaceFile}
              onImportText={importText}
              isImporting={isImporting}
              isTagging={isTagging}
              isReadingClipboard={isReadingClipboard}
              progress={progress}
              clipEnabled={workspaceMeta.settings.clipEnabled}
              onClipEnabledChange={(enabled) => updateSettings({ clipEnabled: enabled })}
            />
          </div>

          <section className="min-w-0 space-y-4">
            <Toolbar
              search={workspaceMeta.view.searchQuery}
              onSearchChange={(search) => updateView({ searchQuery: search })}
              layout={workspaceMeta.view.layout}
              onLayoutChange={(layout) => updateView({ layout })}
              title={workspaceMeta.view.boardTitle}
              onTitleChange={(boardTitle) => updateView({ boardTitle })}
              canExport={exportTargets.length > 0}
              isExporting={isExporting}
              onExportPng={() => void handleExportPng()}
              onExportPdf={() => void handleExportPdf()}
              onRetag={() => void retagWithClip()}
              onClear={() => void clearImages()}
            />
            <MoodBoard
              images={filteredImages}
              layout={workspaceMeta.view.layout}
              activeId={activeImage?.id ?? null}
              onActiveChange={(id) => updateView({ activeImageId: id })}
              onRemove={(id) => void removeImage(id)}
            />
          </section>

          <Inspector
            image={activeImage}
            total={status.total}
            tagged={status.tagged}
            failed={status.failed}
            tags={tags}
            activeTag={workspaceMeta.view.activeTag}
            onTagChange={(activeTag) => updateView({ activeTag })}
            report={workspaceMeta.lastImportReport}
            settings={workspaceMeta.settings}
            onSettingsChange={updateSettings}
            onExportWorkspace={() => void exportWorkspaceState()}
            onCopySummary={() => void copyWorkspaceSummary()}
            onFactoryReset={() => void factoryReset()}
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
