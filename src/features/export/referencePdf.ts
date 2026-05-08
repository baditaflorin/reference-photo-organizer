import { imageToCanvasDataUrl } from '../library/imageProcessing';
import type { ExportOptions, ImageAsset } from '../library/types';
import type { jsPDF as JsPdfConstructor } from 'jspdf';

type PdfDocument = InstanceType<typeof JsPdfConstructor>;

export async function createReferencePdf(images: ImageAsset[], options: ExportOptions) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 34;
  const gap = 18;
  const columns = 3;
  const rows = 2;
  const cellWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
  const cellHeight = (pageHeight - margin * 2 - 46 - gap * (rows - 1)) / rows;

  for (const [index, image] of images.entries()) {
    if (index > 0 && index % (columns * rows) === 0) {
      pdf.addPage('a4', 'landscape');
    }

    if (index % (columns * rows) === 0) {
      drawHeader(pdf, options.title || 'Reference Photo Organizer', pageWidth, margin);
    }

    const pageIndex = index % (columns * rows);
    const column = pageIndex % columns;
    const row = Math.floor(pageIndex / columns);
    const x = margin + column * (cellWidth + gap);
    const y = margin + 46 + row * (cellHeight + gap);
    const imageHeight = cellHeight - 66;
    const dataUrl = await imageToCanvasDataUrl(
      image.url,
      Math.round(cellWidth * 2),
      Math.round(imageHeight * 2)
    );

    pdf.setFillColor('#fffaf0');
    pdf.roundedRect(x, y, cellWidth, cellHeight, 6, 6, 'F');
    pdf.addImage(dataUrl, 'JPEG', x, y, cellWidth, imageHeight);
    drawPalette(pdf, image, x, y + imageHeight, cellWidth);
    drawLabels(pdf, image, x + 10, y + imageHeight + 24, cellWidth - 20);
  }

  return pdf.output('blob');
}

function drawHeader(pdf: PdfDocument, title: string, pageWidth: number, margin: number) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor('#23211d');
  pdf.text(title, margin, margin + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor('#5b554b');
  pdf.text('Generated locally by Reference Photo Organizer', pageWidth - margin, margin + 6, {
    align: 'right'
  });
}

function drawPalette(pdf: PdfDocument, image: ImageAsset, x: number, y: number, width: number) {
  const swatchWidth = width / Math.max(1, image.palette.length);
  image.palette.forEach((swatch, index) => {
    pdf.setFillColor(swatch.hex);
    pdf.rect(x + swatchWidth * index, y, swatchWidth + 0.5, 12, 'F');
  });
}

function drawLabels(pdf: PdfDocument, image: ImageAsset, x: number, y: number, width: number) {
  pdf.setTextColor('#23211d');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(truncate(image.name, 42), x, y, { maxWidth: width });

  pdf.setTextColor('#5b554b');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(truncate(image.tags.map((tag) => tag.label).join(', '), 76), x, y + 14, { maxWidth: width });
  pdf.text(`${image.width} x ${image.height}px`, x, y + 28);
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}
