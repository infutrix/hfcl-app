/** Upload budget for a fiber photo sent to the main server. */
export const MAX_UPLOAD_IMAGE_BYTES = 1_000_000

/**
 * Tried in order until one fits the budget. The camera's 4512x3056 PNGs (~35 MB) come out of the
 * first step at ~0.5-0.8 MB, visually identical for checking a colour call by eye; the later steps
 * only matter for unusually detailed frames.
 */
const STEPS = [
  { maxEdge: 2560, quality: 0.92 },
  { maxEdge: 2560, quality: 0.85 },
  { maxEdge: 2048, quality: 0.85 },
  { maxEdge: 1600, quality: 0.8 },
] as const

function encodeJpeg(bitmap: ImageBitmap, maxEdge: number, quality: number): Promise<Blob | null> {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext("2d")
  if (!context) return Promise.resolve(null)
  context.imageSmoothingQuality = "high"
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
}

/**
 * Shrinks a fiber photo for upload: downscaled, high-quality JPEG under MAX_UPLOAD_IMAGE_BYTES.
 * Not bit-lossless (no lossless format gets a noisy 35 MB sensor frame near 1 MB); the AI still
 * judges the full-resolution original, and that original stays on this PC under otdr-runs/.
 */
export async function compressForUpload(image: Blob): Promise<Blob> {
  if (image.size <= MAX_UPLOAD_IMAGE_BYTES) return image

  const bitmap = await createImageBitmap(image)
  try {
    let smallest: Blob | null = null
    for (const step of STEPS) {
      const encoded = await encodeJpeg(bitmap, step.maxEdge, step.quality)
      if (!encoded) continue
      if (encoded.size <= MAX_UPLOAD_IMAGE_BYTES) return encoded
      if (!smallest || encoded.size < smallest.size) smallest = encoded
    }
    return smallest ?? image
  } finally {
    bitmap.close()
  }
}
