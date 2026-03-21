import sharp from "sharp";

const dataUrlToBuffer = (dataUrl) => {
  if (!dataUrl?.startsWith("data:")) return null;
  const [, payload] = dataUrl.split(",");
  return Buffer.from(payload, "base64");
};

const bufferToDataUrl = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`;

export const processSignature = async (inputBuffer) => {
  const blackWhite = sharp(inputBuffer).flatten({ background: "#ffffff" }).greyscale().threshold(180);
  const alphaMask = await sharp(inputBuffer)
    .flatten({ background: "#ffffff" })
    .greyscale()
    .threshold(180)
    .negate()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const thresholded = await blackWhite.raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(thresholded.info.width * thresholded.info.height * 4);

  for (let index = 0; index < thresholded.info.width * thresholded.info.height; index += 1) {
    const value = thresholded.data[index];
    const alpha = alphaMask.data[index];
    const rgbaIndex = index * 4;

    rgba[rgbaIndex] = value === 0 ? 0 : 0;
    rgba[rgbaIndex + 1] = value === 0 ? 0 : 0;
    rgba[rgbaIndex + 2] = value === 0 ? 0 : 0;
    rgba[rgbaIndex + 3] = alpha;
  }

  return sharp(rgba, {
    raw: {
      width: thresholded.info.width,
      height: thresholded.info.height,
      channels: 4
    }
  })
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
};

export const processSignatureDataUrl = async (dataUrl) => {
  const buffer = dataUrlToBuffer(dataUrl);
  if (!buffer) return null;
  const cleanedBuffer = await processSignature(buffer);
  return bufferToDataUrl(cleanedBuffer);
};
