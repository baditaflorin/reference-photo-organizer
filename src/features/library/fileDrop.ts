interface FileSystemEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
}

interface FileSystemFileEntryLike extends FileSystemEntryLike {
  file: (success: (file: File) => void, error?: (error: DOMException) => void) => void;
}

interface FileSystemDirectoryEntryLike extends FileSystemEntryLike {
  createReader: () => {
    readEntries: (
      success: (entries: FileSystemEntryLike[]) => void,
      error?: (error: DOMException) => void
    ) => void;
  };
}

export async function filesFromDataTransfer(dataTransfer: DataTransfer) {
  const entries = [...dataTransfer.items]
    .map((item) =>
      'webkitGetAsEntry' in item ? (item.webkitGetAsEntry() as unknown as FileSystemEntryLike | null) : null
    )
    .filter((entry): entry is FileSystemEntryLike => Boolean(entry));

  if (entries.length === 0) {
    return [...dataTransfer.files].filter(isImageFile);
  }

  const files = (await Promise.all(entries.map((entry) => traverseEntry(entry)))).flat();
  return files.filter(isImageFile);
}

export function filesFromInput(fileList: FileList | null) {
  return fileList ? [...fileList].filter(isImageFile) : [];
}

export function isImageFile(file: File) {
  return file.type.startsWith('image/') || /\.(avif|gif|jpe?g|png|webp|svg)$/i.test(file.name);
}

async function traverseEntry(entry: FileSystemEntryLike): Promise<File[]> {
  if (entry.isFile) {
    return [await readFileEntry(entry as FileSystemFileEntryLike)];
  }

  if (entry.isDirectory) {
    const directory = entry as FileSystemDirectoryEntryLike;
    const children = await readDirectoryEntries(directory);
    return (await Promise.all(children.map((child) => traverseEntry(child)))).flat();
  }

  return [];
}

function readFileEntry(entry: FileSystemFileEntryLike) {
  return new Promise<File>((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

async function readDirectoryEntries(directory: FileSystemDirectoryEntryLike) {
  const reader = directory.createReader();
  const entries: FileSystemEntryLike[] = [];

  while (true) {
    const batch = await new Promise<FileSystemEntryLike[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

    if (batch.length === 0) {
      return entries;
    }

    entries.push(...batch);
  }
}
