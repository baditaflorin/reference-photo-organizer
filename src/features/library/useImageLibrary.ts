import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { classifyImageWithClip } from './clipClient';
import { createDemoAssets } from './demoImages';
import { createAssetFromFile } from './imageProcessing';
import { mergeTags } from './tags';
import { clearPersistedImages, loadPersistedImages, persistImage, persistImages } from './storage';
import type { ImageAsset, ImportProgress } from './types';

const clipDisabledByQuery = new URLSearchParams(window.location.search).get('clip') === '0';

export function useImageLibrary() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [clipEnabled, setClipEnabled] = useState(!clipDisabledByQuery);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const imageRef = useRef<ImageAsset[]>([]);

  useEffect(() => {
    imageRef.current = images;
  }, [images]);

  useEffect(() => {
    let active = true;

    void loadPersistedImages()
      .then((records) => {
        if (active && records.length > 0) {
          setImages(records);
          setNotice(`Restored ${records.length} local image${records.length === 1 ? '' : 's'}.`);
        }
      })
      .catch(() => {
        if (active) {
          setNotice('Local restore was skipped.');
        }
      });

    return () => {
      active = false;
      imageRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  const importFiles = useCallback(
    async (files: File[]) => {
      const uniqueImages = dedupeFiles(files);
      if (uniqueImages.length === 0) {
        setNotice('No image files found.');
        return;
      }

      setIsImporting(true);
      setProgress({ total: uniqueImages.length, processed: 0 });

      const imported: ImageAsset[] = [];
      try {
        for (const [index, file] of uniqueImages.entries()) {
          setProgress({ total: uniqueImages.length, processed: index, current: file.name });
          const asset = await createAssetFromFile(file);
          imported.push(asset);
          imageRef.current = upsertImages(imageRef.current, [asset]);
          setImages((current) => upsertImages(current, [asset]));
          await persistImage(asset);
        }

        setProgress({ total: uniqueImages.length, processed: uniqueImages.length });
        setNotice(`Imported ${uniqueImages.length} image${uniqueImages.length === 1 ? '' : 's'}.`);

        if (clipEnabled) {
          await tagAssets(imported);
        }
      } finally {
        setIsImporting(false);
        setProgress(null);
      }
    },
    [clipEnabled]
  );

  const loadDemo = useCallback(async () => {
    setIsImporting(true);
    try {
      const demos = await createDemoAssets();
      imageRef.current = upsertImages(imageRef.current, demos);
      setImages((current) => upsertImages(current, demos));
      await persistImages(demos);
      setNotice('Demo board loaded.');
    } finally {
      setIsImporting(false);
    }
  }, []);

  const retagWithClip = useCallback(async () => {
    const candidates = imageRef.current;
    if (candidates.length === 0) {
      setNotice('Import images before CLIP tagging.');
      return;
    }

    await tagAssets(candidates);
  }, []);

  const clearImages = useCallback(async () => {
    imageRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    imageRef.current = [];
    setImages([]);
    await clearPersistedImages();
    setNotice('Local library cleared.');
  }, []);

  const removeImage = useCallback(async (id: string) => {
    const remaining = imageRef.current.filter((image) => image.id !== id);
    const removed = imageRef.current.find((image) => image.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.url);
    }

    await clearPersistedImages();
    await persistImages(remaining);
    imageRef.current = remaining;
    setImages(remaining);
  }, []);

  const status = useMemo(() => {
    const tagged = images.filter((image) => image.clipStatus === 'tagged').length;
    const failed = images.filter((image) => image.clipStatus === 'failed').length;
    return { tagged, failed, total: images.length };
  }, [images]);

  async function tagAssets(assets: ImageAsset[]) {
    setIsTagging(true);
    try {
      for (const asset of assets) {
        imageRef.current = patchImage(imageRef.current, asset.id, { clipStatus: 'running' });
        setImages((current) => patchImage(current, asset.id, { clipStatus: 'running' }));
        try {
          const clipTags = await classifyImageWithClip(asset.blob);
          const latest = imageRef.current.find((image) => image.id === asset.id) ?? asset;
          const updated = {
            ...latest,
            tags: mergeTags(latest.tags, clipTags),
            clipStatus: 'tagged' as const
          };
          await persistImage(updated);
          setImages((current) => patchImage(current, asset.id, updated));
          imageRef.current = patchImage(imageRef.current, asset.id, updated);
        } catch {
          const latest = imageRef.current.find((image) => image.id === asset.id) ?? asset;
          const updated = { ...latest, clipStatus: 'failed' as const };
          await persistImage(updated);
          setImages((current) => patchImage(current, asset.id, updated));
          imageRef.current = patchImage(imageRef.current, asset.id, updated);
          setNotice('CLIP model unavailable; local tags are still active.');
          break;
        }
      }
    } finally {
      setIsTagging(false);
    }
  }

  return {
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
  };
}

function dedupeFiles(files: File[]) {
  const seen = new Set<string>();
  return files.filter((file) => {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function upsertImages(current: ImageAsset[], incoming: ImageAsset[]) {
  const byId = new Map(current.map((image) => [image.id, image]));
  for (const image of incoming) {
    const previous = byId.get(image.id);
    if (previous && previous.url !== image.url) {
      URL.revokeObjectURL(previous.url);
    }
    byId.set(image.id, image);
  }

  return [...byId.values()];
}

function patchImage(current: ImageAsset[], id: string, patch: Partial<ImageAsset>) {
  return current.map((image) => (image.id === id ? { ...image, ...patch } : image));
}
