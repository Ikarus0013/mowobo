'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { PhotoData, QualityCheckResult } from '@/types/photo'
import { analyzePhotoQuality, convertFileToBase64 } from '@/lib/gemini'

interface QualityCheckerProps {
  photos: PhotoData[]
  onComplete: (updatedPhotos: PhotoData[]) => void
}

export default function QualityChecker({ photos, onComplete }: QualityCheckerProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [qualityResults, setQualityResults] = useState<QualityCheckResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const currentPhoto = photos[currentPhotoIndex]
  const isLastPhoto = currentPhotoIndex === photos.length - 1
  const allPhotosAnalyzed = qualityResults.length >= photos.length && !isAnalyzing

  console.log('QualityChecker state:', {
    isAnalyzing,
    photosLength: photos.length,
    qualityResultsLength: qualityResults.length,
    allPhotosAnalyzed,
    currentPhotoIndex
  })

  const analyzeAllPhotos = useCallback(async () => {
    if (isAnalyzing || qualityResults.length > 0) {
      console.log('Analysis already in progress or completed, skipping')
      return
    }
    
    console.log('Starting analyzeAllPhotos')
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      for (let i = 0; i < photos.length; i++) {
        try {
          console.log(`Analyzing photo ${i + 1} of ${photos.length}`)
          const base64 = await convertFileToBase64(photos[i].file)
          const result = await analyzePhotoQuality(base64, photos[i].type)
          
          setQualityResults(prev => [...prev, result])
          setCurrentPhotoIndex(i)
          setAnalysisProgress(((i + 1) / photos.length) * 100)
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`Error analyzing photo ${i + 1}:`, error)
          setQualityResults(prev => [...prev, {
            score: 0,
            feedback: 'Error analyzing photo',
            suggestions: ['Please try uploading a different photo'],
            isApproved: false
          }])
        }
      }
    } finally {
      console.log('Analysis complete, setting isAnalyzing to false')
      setIsAnalyzing(false)
    }
  }, [photos, isAnalyzing, qualityResults.length])

  useEffect(() => {
    if (photos.length > 0 && qualityResults.length === 0 && !isAnalyzing) {
      console.log('Starting analysis for', photos.length, 'photos')
      analyzeAllPhotos()
    }
  }, [photos.length, qualityResults.length, isAnalyzing, analyzeAllPhotos])

  // Handle completion when all photos are analyzed
  useEffect(() => {
    if (qualityResults.length === photos.length && photos.length > 0 && !isAnalyzing) {
      console.log('All photos analyzed, updating photos with approval status')
      
      // Update photos with approval status and pass back to parent
      const updatedPhotos = photos.map((photo, index) => ({
        ...photo,
        isApproved: qualityResults[index]?.isApproved || false,
        qualityScore: qualityResults[index]?.score || 0,
        qualityFeedback: qualityResults[index]?.feedback || ''
      }))
      
      console.log('Updated photos:', updatedPhotos)
      onComplete(updatedPhotos)
    }
  }, [qualityResults.length, photos.length, isAnalyzing, photos, qualityResults, onComplete])

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getApprovalIcon = (isApproved: boolean) => {
    return isApproved ? (
      <CheckCircle className="h-6 w-6 text-green-500" />
    ) : (
      <XCircle className="h-6 w-6 text-red-500" />
    )
  }

  const approvedPhotos = qualityResults.filter(result => result.isApproved).length
  const totalPhotos = qualityResults.length

  if (isAnalyzing) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <Loader2 className="mx-auto h-12 w-12 text-primary-600 animate-spin mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Analyzing Your Photos
          </h2>
          <p className="text-gray-600 mb-6">
            Using AI to check photo quality and provide feedback...
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            {currentPhotoIndex + 1} of {photos.length} photos analyzed
          </p>
        </div>
      </div>
    )
  }

  if (allPhotosAnalyzed) {
    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Quality Check Complete
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {approvedPhotos === totalPhotos ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              )}
              <span className="text-lg font-medium text-gray-900">
                {approvedPhotos} of {totalPhotos} photos approved
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((approvedPhotos / totalPhotos) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Approval Rate</div>
            </div>
          </div>
        </div>

        {/* Individual Photo Results */}
        <div className="space-y-4">
          {photos.map((photo, index) => {
            const result = qualityResults[index]
            if (!result) return null

            return (
              <div key={photo.id} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <img
                    src={photo.preview}
                    alt={`${photo.type} photo`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 capitalize">
                        {photo.type.replace('-', ' ')} Photo
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getApprovalIcon(result.isApproved)}
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(result.score)} ${getScoreColor(result.score)}`}>
                          {result.score}/10
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{result.feedback}</p>
                    
                    {result.suggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-primary-500 mr-2">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Upload New Photos
          </button>
          <button
            onClick={onComplete}
            disabled={approvedPhotos === 0}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              approvedPhotos > 0
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {approvedPhotos > 0 ? 'Generate Portfolio' : 'Need Approved Photos'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Quality Check in Progress
        </h2>
        <p className="text-gray-600">
          Please wait while we analyze your photos...
        </p>
      </div>
    </div>
  )
}
