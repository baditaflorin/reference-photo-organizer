import { wrap } from 'comlink';
import type { Remote } from 'comlink';
import { resizeBlobToDataUrl } from './imageProcessing';
import { CLIP_CANDIDATE_LABELS } from './tags';
import type { ImageTag } from './types';
import type { ClipWorkerApi } from '../../workers/clip.worker';

let workerClient: Remote<ClipWorkerApi> | null = null;

export async function classifyImageWithClip(blob: Blob): Promise<ImageTag[]> {
  const imageDataUrl = await resizeBlobToDataUrl(blob);
  const worker = getClipWorker();
  const result = await worker.classify(imageDataUrl, CLIP_CANDIDATE_LABELS);

  return result
    .filter((item) => item.score >= 0.05)
    .map((item) => ({
      label: item.label,
      score: item.score,
      source: 'clip' as const
    }));
}

function getClipWorker() {
  if (!workerClient) {
    const worker = new Worker(new URL('../../workers/clip.worker.ts', import.meta.url), {
      type: 'module',
      name: 'clip-tagger'
    });
    workerClient = wrap<ClipWorkerApi>(worker);
  }

  return workerClient;
}
