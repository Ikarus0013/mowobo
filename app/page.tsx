'use client'

import { useState } from 'react'
import PhotoUpload from '@/components/PhotoUpload'
import QualityChecker from '@/components/QualityChecker'
import StyleSelection from '@/components/StyleSelection'
import PortfolioGeneration from '@/components/PortfolioGeneration'
import { PhotoData } from '@/types/photo'
import { GeneratedImage } from '@/types/portfolio'

export default function Home() {
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoData[]>([])
  const [currentStep, setCurrentStep] = useState<'upload' | 'quality' | 'style' | 'generate' | 'complete'>('upload')
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [selectedImages, setSelectedImages] = useState<GeneratedImage[]>([])

  const handlePhotosUploaded = (photos: PhotoData[]) => {
    setUploadedPhotos(photos)
    setCurrentStep('quality')
  }

  const handleQualityCheckComplete = (updatedPhotos: PhotoData[]) => {
    console.log('Quality check complete, received photos:', updatedPhotos)
    setUploadedPhotos(updatedPhotos)
    setCurrentStep('style')
  }

  const handleStyleSelected = (style: string) => {
    setSelectedStyle(style)
    setCurrentStep('generate')
  }

  const handlePortfolioComplete = (images: GeneratedImage[]) => {
    setSelectedImages(images)
    setCurrentStep('complete')
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload Your Reference Photos'
      case 'quality':
        return 'Quality Check'
      case 'style':
        return 'Choose Your Portfolio Style'
      case 'generate':
        return 'Generate Your Portfolio'
      case 'complete':
        return 'Portfolio Complete!'
      default:
        return 'AI Model Portfolio Generator'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload your reference photos and let AI create a professional model portfolio for you'
      case 'quality':
        return 'AI is analyzing your photos for quality and providing feedback'
      case 'style':
        return 'Select the style that best matches your target audience and career goals'
      case 'generate':
        return 'AI is generating professional portfolio variations for you to choose from'
      case 'complete':
        return 'Your portfolio has been generated successfully!'
      default:
        return ''
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getStepTitle()}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getStepDescription()}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {currentStep === 'upload' && (
            <PhotoUpload onPhotosUploaded={handlePhotosUploaded} />
          )}
          
          {currentStep === 'quality' && (
            <QualityChecker 
              photos={uploadedPhotos}
              onComplete={handleQualityCheckComplete}
            />
          )}

          {currentStep === 'style' && (
            <StyleSelection onStyleSelected={handleStyleSelected} />
          )}
          
          {currentStep === 'generate' && (
            <>
              {console.log('Passing photos to PortfolioGeneration:', uploadedPhotos)}
              <PortfolioGeneration 
                photos={uploadedPhotos}
                selectedStyle={selectedStyle}
                onComplete={handlePortfolioComplete}
              />
            </>
          )}
          
          {currentStep === 'complete' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Portfolio Generation Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                You've selected {selectedImages.length} images for your {selectedStyle} portfolio.
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Another Portfolio
                </button>
                <button
                  onClick={() => setCurrentStep('style')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try Different Style
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
