'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { PhotoData, PhotoRequirements } from '@/types/photo'

interface PhotoUploadProps {
  onPhotosUploaded: (photos: PhotoData[]) => void
}

const PHOTO_REQUIREMENTS: PhotoRequirements = {
  face: {
    required: true,
    description: 'Clear front-facing headshot',
    tips: ['Good lighting', 'Neutral expression', 'Clean background']
  },
  profile: {
    required: false,
    description: 'Clear side profile shot',
    tips: ['Side view of face', 'Good lighting', 'Clean background']
  },
  'half-body': {
    required: false,
    description: 'Waist-up shot',
    tips: ['Good posture', 'Clear view of upper body', 'Good lighting']
  },
  'full-body': {
    required: false,
    description: 'Full body shot',
    tips: ['Complete body visible', 'Good posture', 'Clean background']
  },
  walking: {
    required: false,
    description: 'Dynamic walking shot',
    tips: ['Natural movement', 'Good lighting', 'Clear view of body']
  }
}

export default function PhotoUpload({ onPhotosUploaded }: PhotoUploadProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoData[]>([])
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos: PhotoData[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      type: 'face' as const, // Default type, user will assign
    }))

    setUploadedPhotos(prev => [...prev, ...newPhotos])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removePhoto = (id: string) => {
    setUploadedPhotos(prev => {
      const photo = prev.find(p => p.id === id)
      if (photo) {
        URL.revokeObjectURL(photo.preview)
      }
      return prev.filter(p => p.id !== id)
    })
  }

  const assignPhotoType = (id: string, type: keyof PhotoRequirements) => {
    setUploadedPhotos(prev => 
      prev.map(photo => 
        photo.id === id ? { ...photo, type } : photo
      )
    )
  }

  const getRequiredTypes = () => {
    return Object.entries(PHOTO_REQUIREMENTS)
      .filter(([_, req]) => req.required)
      .map(([type, _]) => type as keyof PhotoRequirements)
  }

  const getAssignedTypes = () => {
    return uploadedPhotos.map(photo => photo.type)
  }

  const isReadyToProceed = () => {
    const requiredTypes = getRequiredTypes()
    const assignedTypes = getAssignedTypes()
    return requiredTypes.every(type => assignedTypes.includes(type))
  }

  const handleProceed = () => {
    if (isReadyToProceed()) {
      onPhotosUploaded(uploadedPhotos)
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Drop your photos here' : 'Upload your reference photos'}
        </p>
        <p className="text-gray-500">
          Drag and drop or click to select images (max 10MB each)
        </p>
      </div>

      {/* Photo Requirements */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Required Photo Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(PHOTO_REQUIREMENTS).map(([type, req]) => (
            <div key={type} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getAssignedTypes().includes(type as keyof PhotoRequirements) ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {type.replace('-', ' ')} {req.required && <span className="text-red-500">*</span>}
                </h4>
                <p className="text-sm text-gray-600">{req.description}</p>
                <ul className="text-xs text-gray-500 mt-1">
                  {req.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Photos */}
      {uploadedPhotos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Uploaded Photos ({uploadedPhotos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.preview}
                  alt="Uploaded photo"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2">
                  <select
                    value={photo.type}
                    onChange={(e) => assignPhotoType(photo.id, e.target.value as keyof PhotoRequirements)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="face">Face Shot</option>
                    <option value="profile">Profile Shot</option>
                    <option value="half-body">Half Body</option>
                    <option value="full-body">Full Body</option>
                    <option value="walking">Walking Shot</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proceed Button */}
      {uploadedPhotos.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleProceed}
            disabled={!isReadyToProceed()}
            className={`
              px-8 py-3 rounded-lg font-medium transition-colors
              ${isReadyToProceed()
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isReadyToProceed() ? 'Proceed to Quality Check' : 'Complete Required Photos'}
          </button>
        </div>
      )}
    </div>
  )
}
