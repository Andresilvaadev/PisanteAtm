export async function toWebP(file: File, maxKB = 250): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const MAX_DIM = 1200
      let { width, height } = img
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = MAX_DIM / Math.max(width, height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)

      const attempt = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Falha ao converter imagem'))
            if (blob.size <= maxKB * 1024 || quality <= 0.3) resolve(blob)
            else attempt(Math.round((quality - 0.1) * 10) / 10)
          },
          'image/webp',
          quality,
        )
      }
      attempt(0.85)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Falha ao carregar imagem'))
    }
    img.src = objectUrl
  })
}
