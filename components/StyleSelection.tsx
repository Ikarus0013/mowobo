'use client'

import { useState } from 'react'
import { Camera, Briefcase, Heart, Zap } from 'lucide-react'
import { StyleOption } from '@/types/portfolio'

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'commercial',
    name: 'Commercial',
    description: 'Clean, professional, approachable for brands and corporate work',
    icon: 'Briefcase',
    color: 'blue',
    examples: ['Beauty brands', 'Lifestyle products', 'Corporate headshots']
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'High-end, editorial, artistic for fashion and luxury brands',
    icon: 'Camera',
    color: 'purple',
    examples: ['Fashion editorials', 'Luxury brands', 'High-end campaigns']
  },
  {
    id: 'beauty',
    name: 'Beauty',
    description: 'Close-up focused, skincare and makeup oriented',
    icon: 'Heart',
    color: 'pink',
    examples: ['Skincare brands', 'Makeup campaigns', 'Beauty editorials']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'Casual, relatable, everyday scenarios',
    icon: 'Zap',
    color: 'green',
    examples: ['Social media', 'Casual brands', 'Lifestyle content']
  }
]

interface StyleSelectionProps {
  onStyleSelected: (style: string) => void
}

export default function StyleSelection({ onStyleSelected }: StyleSelectionProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('')

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId)
  }

  const handleContinue = () => {
    if (selectedStyle) {
      onStyleSelected(selectedStyle)
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="h-8 w-8" />
      case 'Camera':
        return <Camera className="h-8 w-8" />
      case 'Heart':
        return <Heart className="h-8 w-8" />
      case 'Zap':
        return <Zap className="h-8 w-8" />
      default:
        return <Camera className="h-8 w-8" />
    }
  }

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = 'border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg'
    
    if (isSelected) {
      switch (color) {
        case 'blue':
          return `${baseClasses} border-blue-500 bg-blue-50 shadow-md`
        case 'purple':
          return `${baseClasses} border-purple-500 bg-purple-50 shadow-md`
        case 'pink':
          return `${baseClasses} border-pink-500 bg-pink-50 shadow-md`
        case 'green':
          return `${baseClasses} border-green-500 bg-green-50 shadow-md`
        default:
          return `${baseClasses} border-gray-500 bg-gray-50 shadow-md`
      }
    }
    
    return `${baseClasses} border-gray-200 bg-white hover:border-gray-300`
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Portfolio Style
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the style that best matches your target audience and career goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STYLE_OPTIONS.map((style) => (
          <div
            key={style.id}
            onClick={() => handleStyleSelect(style.id)}
            className={getColorClasses(style.color, selectedStyle === style.id)}
          >
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 ${
                selectedStyle === style.id 
                  ? `text-${style.color}-600` 
                  : 'text-gray-400'
              }`}>
                {getIcon(style.icon)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {style.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {style.description}
                </p>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Perfect for:</h4>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {style.examples.map((example, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStyle && (
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Generate Portfolio with {STYLE_OPTIONS.find(s => s.id === selectedStyle)?.name} Style
          </button>
        </div>
      )}
    </div>
  )
}
