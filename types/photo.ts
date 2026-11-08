export interface PhotoData {
  id: string
  file: File
  preview: string
  type: 'face' | 'profile' | 'half-body' | 'full-body' | 'walking'
  qualityScore?: number
  qualityFeedback?: string
  isApproved?: boolean
}

export interface QualityCheckResult {
  score: number
  feedback: string
  suggestions: string[]
  isApproved: boolean
}

export interface PhotoRequirements {
  face: {
    required: true
    description: 'Clear front-facing headshot'
    tips: ['Good lighting', 'Neutral expression', 'Clean background']
  }
  profile: {
    required: true
    description: 'Clear side profile shot'
    tips: ['Side view of face', 'Good lighting', 'Clean background']
  }
  'half-body': {
    required: true
    description: 'Waist-up shot'
    tips: ['Good posture', 'Clear view of upper body', 'Good lighting']
  }
  'full-body': {
    required: true
    description: 'Full body shot'
    tips: ['Complete body visible', 'Good posture', 'Clean background']
  }
  walking: {
    required: false
    description: 'Dynamic walking shot'
    tips: ['Natural movement', 'Good lighting', 'Clear view of body']
  }
}
