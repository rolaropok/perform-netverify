const pngSignature = 'PNG\r\n\x1a\n';
const pngImageHeaderChunkName = 'IHDR';
const pngFriedChunkName = 'CgBI';

export function validatePNG(buffer: Buffer) {
  if (pngSignature === buffer.toString('ascii', 1, 8)) {
    let chunkName = buffer.toString('ascii', 12, 16)
    if (chunkName === pngFriedChunkName) {
      chunkName = buffer.toString('ascii', 28, 32)
    }
    if (chunkName !== pngImageHeaderChunkName) {
      return false
    }
    return true
  }
  return false
}

export function calculatePNG(buffer: Buffer) {
  if (buffer.toString('ascii', 12, 16) === pngFriedChunkName) {
    return {
      height: buffer.readUInt32BE(36),
      width: buffer.readUInt32BE(32)
    }
  }
  return {
    height: buffer.readUInt32BE(20),
    width: buffer.readUInt32BE(16)
  }
}