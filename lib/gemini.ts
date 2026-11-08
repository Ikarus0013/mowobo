export async function analyzePhotoQuality(
  imageData: string,
  photoType: string
): Promise<{
  score: number
  feedback: string
  suggestions: string[]
  isApproved: boolean
}> {
  try {
    console.log('Starting photo analysis for:', photoType)
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch('/api/analyze-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
        photoType
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('Got response from API')
    const result = await response.json()
    console.log('Analysis result:', result)
    return result
  } catch (error) {
    console.error('Error analyzing photo quality:', error)
    if (error.name === 'AbortError') {
      return {
        score: 0,
        feedback: 'Analysis timed out. Please try again with a smaller image.',
        suggestions: ['Try uploading a smaller image', 'Ensure good internet connection'],
        isApproved: false
      }
    }
    return {
      score: 0,
      feedback: 'Error analyzing photo. Please try again.',
      suggestions: ['Ensure photo is clear and well-lit', 'Try uploading a different photo'],
      isApproved: false
    }
  }
}

export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
