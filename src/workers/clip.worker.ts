import { expose } from 'comlink';
import { LogLevel, env, pipeline } from '@huggingface/transformers';

interface ClipOutput {
  label: string;
  score: number;
}

let classifierPromise: ReturnType<typeof createClassifier> | null = null;

async function createClassifier() {
  env.allowLocalModels = false;
  env.allowRemoteModels = true;
  env.useBrowserCache = true;
  env.logLevel = LogLevel.ERROR;
  const onnxBackend = env.backends.onnx as { wasm?: { numThreads?: number } };
  onnxBackend.wasm ??= {};
  onnxBackend.wasm.numThreads = 1;

  return pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
    dtype: 'q8',
    device: 'wasm'
  });
}

async function getClassifier() {
  classifierPromise ??= createClassifier();
  return classifierPromise;
}

const api = {
  async classify(imageDataUrl: string, labels: string[]) {
    const classifier = await getClassifier();
    const output = (await classifier(imageDataUrl, labels, {
      hypothesis_template: 'a reference photo of {}'
    })) as ClipOutput[];

    return output
      .filter((item) => Number.isFinite(item.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map((item) => ({
        label: item.label.toLowerCase(),
        score: item.score
      }));
  }
};

export type ClipWorkerApi = typeof api;

expose(api);
