interface DataTransferItemWithWebKitEntry extends DataTransferItem {
  webkitGetAsEntry: () => FileSystemEntry | null;
}

export async function filesFromDataTransfer(dataTransfer: DataTransfer) {
  const entries = [...dataTransfer.items]
    .map(getWebKitEntry)
    .filter((entry): entry is FileSystemEntry => entry !== null);

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

function getWebKitEntry(item: DataTransferItem) {
  if (!hasWebKitEntry(item)) {
    return null;
  }
  return item.webkitGetAsEntry();
}

function hasWebKitEntry(item: DataTransferItem): item is DataTransferItemWithWebKitEntry {
  return 'webkitGetAsEntry' in item && typeof item.webkitGetAsEntry === 'function';
}

async function traverseEntry(entry: FileSystemEntry, parentPath = ''): Promise<File[]> {
  if (entry.isFile) {
    const file = await readFileEntry(entry as FileSystemFileEntry);
    const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
    defineRelativePath(file, relativePath);
    return [file];
  }

  if (entry.isDirectory) {
    const directory = entry as FileSystemDirectoryEntry;
    const nextParentPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
    const children = await readDirectoryEntries(directory);
    return (await Promise.all(children.map((child) => traverseEntry(child, nextParentPath)))).flat();
  }

  return [];
}

function readFileEntry(entry: FileSystemFileEntry): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

async function readDirectoryEntries(directory: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = directory.createReader();
  const entries: FileSystemEntry[] = [];

  while (true) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

    if (batch.length === 0) {
      return entries;
    }

    entries.push(...batch);
  }
}

function defineRelativePath(file: File, webkitRelativePath: string) {
  try {
    Object.defineProperty(file, 'webkitRelativePath', {
      configurable: true,
      enumerable: true,
      value: webkitRelativePath
    });
  } catch {
    // Some browsers expose File objects as non-configurable; fallback to name-only paths there.
  }
}
