'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { PhotoData } from '@/types/photo'
import { GeneratedImage } from '@/types/portfolio'

interface PortfolioGenerationProps {
  photos: PhotoData[]
  selectedStyle: string
  onComplete: (selectedImages: GeneratedImage[]) => void
}

export default function PortfolioGeneration({ photos, selectedStyle, onComplete }: PortfolioGenerationProps) {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState<GeneratedImage[]>([])

  useEffect(() => {
    if (photos.length > 0 && selectedStyle) {
      generatePortfolio()
    }
  }, [photos, selectedStyle])

  const generatePortfolio = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      console.log('Photos received in PortfolioGeneration:', photos)
      console.log('Photos type:', typeof photos, 'Is array:', Array.isArray(photos))
      
      // Safety check for photos array
      if (!Array.isArray(photos) || photos.length === 0) {
        throw new Error('No photos available for portfolio generation')
      }
      
      console.log('Looking for face photo with isApproved:', photos.filter(p => p.type === 'face'))
      
      // Get the first approved photo (face photo)
      let facePhoto = photos.find(photo => photo.type === 'face' && photo.isApproved)
      
      // Fallback: if no approved face photo found, use the first face photo
      if (!facePhoto) {
        console.log('No approved face photo found, using first face photo as fallback')
        facePhoto = photos.find(photo => photo.type === 'face')
      }
      
      console.log('Found face photo:', facePhoto)
      
      if (!facePhoto) {
        throw new Error('No face photo found')
      }

      // Convert to base64
      const base64 = await convertFileToBase64(facePhoto.file)

      // Call generation API
      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          style: selectedStyle,
          photoType: 'face'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate portfolio')
      }

      const result = await response.json()
      setGeneratedImages(result.images)
      setGenerationProgress(100)
    } catch (error) {
      console.error('Error generating portfolio:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const convertFileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const toggleImageSelection = (image: GeneratedImage) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.id === image.id)
      if (isSelected) {
        return prev.filter(img => img.id !== image.id)
      } else {
        return [...prev, { ...image, isSelected: true }]
      }
    })
  }

  const handleContinue = () => {
    if (selectedImages.length > 0) {
      onComplete(selectedImages)
    }
  }

  const handleRegenerate = () => {
    setGeneratedImages([])
    setSelectedImages([])
    setGenerationProgress(0)
    generatePortfolio()
  }

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <Loader2 className="mx-auto h-12 w-12 text-primary-600 animate-spin mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Generating Your Portfolio
          </h2>
          <p className="text-gray-600 mb-6">
            Creating {selectedStyle} style variations using AI...
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            {generationProgress}% complete
          </p>
        </div>
      </div>
    )
  }

  if (generatedImages.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Generation Failed
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error generating your portfolio. Please try again.
          </p>
          <button
            onClick={handleRegenerate}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Select Your Favorite Images
        </h2>
        <p className="text-gray-600 mb-4">
          Choose the images you like best for your {selectedStyle} portfolio
        </p>
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm text-gray-500">
            {selectedImages.length} of {generatedImages.length} selected
          </span>
          <button
            onClick={handleRegenerate}
            className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generate New Set</span>
          </button>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {generatedImages.map((image) => {
          const isSelected = selectedImages.some(img => img.id === image.id)
          return (
            <div
              key={image.id}
              onClick={() => toggleImageSelection(image)}
              className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary-500 ring-offset-2' 
                  : 'hover:shadow-lg'
              }`}
            >
              {/* Placeholder for generated image */}
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-sm text-gray-500">Generated Image</div>
                  <div className="text-xs text-gray-400 mt-1">{image.prompt.substring(0, 50)}...</div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                    {isSelected ? 'Selected' : 'Click to select'}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Continue Button */}
      {selectedImages.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Continue with {selectedImages.length} Selected Images
          </button>
        </div>
      )}
    </div>
  )
}
