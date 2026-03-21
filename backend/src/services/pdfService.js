import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const isPdf = (filePath) => filePath.toLowerCase().endsWith(".pdf");
const isPng = (filePath) => filePath.toLowerCase().endsWith(".png");
const isJpg = (filePath) => /\.(jpg|jpeg)$/i.test(filePath);

const dataUrlToBytes = (dataUrl) => {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const parts = dataUrl.split(",");
  return Buffer.from(parts[1], "base64");
};

const drawWrappedText = (page, text, startY) => {
  const lines = (text || "Attached document submitted by student.").split("\n");
  let y = startY;
  for (const line of lines) {
    page.drawText(line, {
      x: 60,
      y,
      size: 12,
      color: rgb(0.15, 0.19, 0.27)
    });
    y -= 18;
  }
};

const scaleBoxToPage = (box, page) => {
  const previewWidth = box.previewWidth || page.getWidth();
  const previewHeight = box.previewHeight || page.getHeight();
  const scaleX = page.getWidth() / previewWidth;
  const scaleY = page.getHeight() / previewHeight;

  return {
    x: box.x * scaleX,
    y: box.y * scaleY,
    width: box.width * scaleX,
    height: box.height * scaleY
  };
};

const drawSignatureOnPage = async (pdfDoc, page, signatureData, box, label) => {
  if (!box) return;
  const scaled = scaleBoxToPage(box, page);

  const bytes = dataUrlToBytes(signatureData);
  if (!bytes) {
    page.drawRectangle({
      x: scaled.x,
      y: page.getHeight() - scaled.y - scaled.height,
      width: scaled.width,
      height: scaled.height,
      borderWidth: 1,
      borderColor: rgb(0.58, 0.64, 0.72),
      opacity: 0.6
    });
    page.drawText(label, {
      x: scaled.x + 10,
      y: page.getHeight() - scaled.y - scaled.height / 2,
      size: 10,
      color: rgb(0.35, 0.4, 0.47)
    });
    return;
  }

  let image;
  if (signatureData.includes("image/png")) {
    image = await pdfDoc.embedPng(bytes);
  } else if (signatureData.includes("image/jpeg") || signatureData.includes("image/jpg")) {
    image = await pdfDoc.embedJpg(bytes);
  }

  if (!image) {
    page.drawText(label, {
      x: scaled.x + 10,
      y: page.getHeight() - scaled.y - scaled.height / 2,
      size: 10,
      color: rgb(0.35, 0.4, 0.47)
    });
    return;
  }

  const padding = Math.min(scaled.width, scaled.height) * 0.14;
  const availableWidth = Math.max(scaled.width - padding * 2, 24);
  const availableHeight = Math.max(scaled.height - padding * 2, 24);
  const imageRatio = image.width / image.height;
  const boxRatio = availableWidth / availableHeight;

  let renderWidth = availableWidth;
  let renderHeight = availableHeight;

  if (imageRatio > boxRatio) {
    renderHeight = renderWidth / imageRatio;
  } else {
    renderWidth = renderHeight * imageRatio;
  }

  page.drawImage(image, {
    x: scaled.x + (scaled.width - renderWidth) / 2,
    y: page.getHeight() - scaled.y - scaled.height + (scaled.height - renderHeight) / 2,
    width: renderWidth,
    height: renderHeight
  });
};

export const buildFinalDocumentPdf = async ({ request, student, faculty, hod, facultySignature, hodSignature }) => {
  const pdfDoc = await PDFDocument.create();

  if (request.documentUrl) {
    const filePath = path.resolve(process.cwd(), "backend", request.documentUrl.replace(/^\//, ""));
    const fallbackPath = path.resolve(process.cwd(), request.documentUrl.replace(/^\//, ""));
    const resolvedPath = fs.existsSync(filePath) ? filePath : fallbackPath;
    if (fs.existsSync(resolvedPath)) {
      const fileBytes = fs.readFileSync(resolvedPath);

      if (isPdf(resolvedPath)) {
        const sourcePdf = await PDFDocument.load(fileBytes);
        const copiedPages = await pdfDoc.copyPages(sourcePdf, sourcePdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      } else if (isPng(resolvedPath) || isJpg(resolvedPath)) {
        const image = isPng(resolvedPath) ? await pdfDoc.embedPng(fileBytes) : await pdfDoc.embedJpg(fileBytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
    }
  }

  if (!pdfDoc.getPageCount()) {
    const page = pdfDoc.addPage([595, 842]);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("Document Approval System", {
      x: 60,
      y: 780,
      size: 20,
      font: titleFont,
      color: rgb(0.06, 0.2, 0.41)
    });
    page.drawText(`Title: ${request.title}`, { x: 60, y: 748, size: 12, font: bodyFont });
    page.drawText(`Student: ${student.name} (${student.rollNo})`, { x: 60, y: 728, size: 12, font: bodyFont });
    page.drawText(`Department: ${student.department}`, { x: 60, y: 708, size: 12, font: bodyFont });
    page.drawText(`Faculty: ${faculty.name}`, { x: 60, y: 688, size: 12, font: bodyFont });
    page.drawText(`HOD: ${hod.name}`, { x: 60, y: 668, size: 12, font: bodyFont });
    drawWrappedText(page, request.content, 620);
  }

  const facultyPage = pdfDoc.getPage(Math.max((request.facultySignatureBox?.page || 1) - 1, 0));
  const hodPage = pdfDoc.getPage(Math.max((request.hodSignatureBox?.page || 1) - 1, 0));
  await drawSignatureOnPage(pdfDoc, facultyPage, facultySignature, request.facultySignatureBox, "Faculty Signature");
  await drawSignatureOnPage(pdfDoc, hodPage, hodSignature, request.hodSignatureBox, "HOD Signature");

  return Buffer.from(await pdfDoc.save());
};
